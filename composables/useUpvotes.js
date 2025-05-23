import { ref } from "vue";

// Remove the TypeScript interface, as it's not needed in JavaScript

export function useUpvotes(userId) {
  // Define a reactive reference to store the upvoted profiles
  const upvotedProfiles = ref([]);
  const upvotedMeProfiles = ref([]);

  const {
    getUserUpvotedProfiles,
    getUserUpvotedMeProfiles,
    deleteUpvoteFromUser,
  } = useDb();

  // Function to fetch upvoted profiles from db
  const fetchUpvotes = async () => {
    if (userId) {
      const data = await getUserUpvotedProfiles(userId);

      if (data) {
        upvotedProfiles.value = data; // Type assertion is not needed in JavaScript
        // console.log("Upvoted profiles:", upvotedProfiles.value);
      }
    }
  };

  // Function to fetch upvoted profiles from db
  const fetchMyUpvotes = async () => {
    if (userId) {
      const data = await getUserUpvotedMeProfiles(userId);

      if (data) {
        upvotedMeProfiles.value = data; // Type assertion is not needed in JavaScript
        // console.log("Upvoted me:", upvotedProfiles.value);
      }
    }
  };

  // Function to remove a user from the upvoted profiles
  // const unupvoteUser = async (upvotedProfileId) => {
  //   if (userId) {
  //     // console.log("userId: ", userId, "profileId: ", upvotedProfileId)
  //     const error = await deleteUpvoteFromUser(userId, upvotedProfileId);
  //     // console.log("deleteUpvoteFromUser result:", error);

  //     if (!error) {
  //       upvotedProfiles.value = upvotedProfiles.value.filter(
  //         (profile) => profile.profile_id !== upvotedProfileId
  //       );
  //     }
  //   }
  // };
  const unupvoteUser = async (upvotedProfileId) => {
    console.log(
      "Attempting to unupvote, userId:",
      userId,
      " profileId: ",
      upvotedProfileId
    );

    const { error, data } = await deleteUpvoteFromUser(
      userId,
      upvotedProfileId
    );
    console.log("Supabase delete result:", { error, data });

    if (error) {
      console.error("Failed to delete upvote:", error.message);
    } else {
      upvotedProfiles.value = upvotedProfiles.value.filter(
        (profile) => profile.profile_id !== upvotedProfileId
      );
    }
  };

  // Fetch profiles initially when the composable is used
  fetchUpvotes();
  fetchMyUpvotes();

  // Return the reactive data and methods
  return {
    upvotedProfiles,
    upvotedMeProfiles,
    fetchUpvotes,
    fetchMyUpvotes,
    unupvoteUser,
  };
}
