import { usePresenceStore } from '@/stores/presenceStore';

export const usePresenceChannel = (userId, favoriteProfiles, t) =>
{
	const supabase = useSupabaseClient();
	const presenceStore = usePresenceStore();
	
	const OFFLINE_THRESHOLD_MS = 10 * 60 * 1000; // 10 minutes
	const lastSeenKey = 'presence:lastSeenTimestamps';

	const getLastSeenTimestamps = () =>
		JSON.parse(localStorage.getItem(lastSeenKey) || '{}');

	const setLastSeenTimestamp = (userId) =>
	{
		const seen = getLastSeenTimestamps();
		seen[userId] = new Date().toISOString();
		localStorage.setItem(lastSeenKey, JSON.stringify(seen));
	};

	const getTimeSinceLastSeen = (userId) =>
	{
		const seen = getLastSeenTimestamps();
		const lastSeen = seen[userId] ? new Date(seen[userId]) : null;
		if (!lastSeen) return Infinity; // Treat as never seen
		return Date.now() - lastSeen.getTime();
	};

	const channel = supabase.channel("presence:global", {
		config: {
			presence: { key: userId },
		},
	});

	const syncs = ref(0);
	channel
		.on("presence", { event: "sync" }, () =>
		{
			//We ignore the first sync event because the current user isn't tracked yet
			if(syncs.value == 0){
				syncs.value++;
				return;
			} 

			if (syncs.value == 1) {
				syncs.value++;
				const state = channel.presenceState();
				// Get the current online users and their statuses
				const usersWithStatus = Object.entries(state).map(([userId, metas]) =>
				{
					return {
						userId,
						status: metas[0]?.status || "online", // fallback to 'online'
					};
				});

				// console.log("sync");
				presenceStore.setOnlineUsers(usersWithStatus); // full data, not just IDs	
				Object.entries(state).forEach(([userId, metas]) =>
				{
					presenceStore.presenceRefs[userId] = metas[0]?.presence_ref;
				});
			}
			
		})
		.on("presence", { event: "join" },  async ({ key, newPresences }) =>
		{
			const meta = newPresences[0];
			const status = meta?.status || 'online';
			const presenceRef = meta?.presence_ref;

			presenceStore.addOnlineUser({ userId: key, status }, presenceRef);
			// console.log("presence join", key, presenceRef, status);

			const { updateLastActive } = useDb();
			await updateLastActive(key);

			// console.log("favorites profiles: ", favoriteProfiles.value);

			
			const isFavoriteOnline = favoriteProfiles.value.some(profile => profile.user_id === key);
			const wasOfflineLongEnough = getTimeSinceLastSeen(key) > OFFLINE_THRESHOLD_MS;

			// console.log("isFavoriteOnline: ", isFavoriteOnline);
			if (isFavoriteOnline && wasOfflineLongEnough)
			{
				const favoritedProfile = favoriteProfiles.value.find(p => p.user_id === key);
				if (favoritedProfile)
				{
					const notificationStore = useNotificationStore();
					notificationStore.addNotification(
						'presence',
						`${favoritedProfile.displayname} ` + t("composables.presenceChannel.online"),
						favoritedProfile.user_id
					);
				}
			}
			
		})
		.on("presence", { event: "leave" }, async  ({ key, leftPresences }) =>
		{
			const leftRef = leftPresences[0]?.presence_ref;

			if (presenceStore.presenceRefs[key] !== leftRef)
			{
				return;
			}

			setLastSeenTimestamp(key); // the user left, so we set the last seen timestamp
			await presenceStore.removeOnlineUser(key);
		})
		.subscribe(async (status) =>
		{
			if (status === "SUBSCRIBED")
			{
				// console.log("Subscribed to presence channel");
				await channel.track({ 
					online_at: new Date().toISOString(),
					status: 'online'
				});
			}
		});

	presenceStore.setChannel(channel);
};
