<template>
  <v-container fluid>
    <v-card-text>
      <v-virtual-scroll :items="users" height="300" item-height="10">
        <template v-slot:default="{ item: user }">
          <v-list-item @click="selectUser(user)">
            <template v-slot:prepend>
              <v-icon :color="getGenderColor(user.gender_id)" :icon="getAvatarIcon(user.gender_id)"
                size="small"></v-icon>

              <div class="avatar-wrapper">
                <v-avatar :image="getAvatar(user.avatar_url, user.gender_id)"></v-avatar>

                <NuxtImg :src="user.avatar_decoration_url" v-if="user.avatar_decoration_url"
                  class="avatar-decoration" />

                <v-icon size="small" color="grey" icon="mdi-circle" class="status-badge" />
              </div>

            </template>
            <v-list-item-title :class="getGenderColorClass(user.gender_id)">
              {{ user.displayname }}
            </v-list-item-title>
            <v-list-item-subtitle>
              {{ user.emoji }} ( {{ user.age }} )
              {{ user.state_name ?? "" }}
            </v-list-item-subtitle>
          </v-list-item>
        </template>
      </v-virtual-scroll>
    </v-card-text>
  </v-container>
</template>

<script setup>
// import {
//   getAvatarIcon,
//   getAvatar,
//   getGenderColor,
//   getGenderColorClass,
// } from "/utils/userUtils";

import { getAvatar, getAvatarIcon, getGenderColor, getGenderColorClass } from "@/composables/useUserUtils";

const props = defineProps({
  users: Array,
  filters: Object,
});

const emit = defineEmits(["user-selected"]);
const selectedUser = ref(null);

const selectUser = (user) => {
  selectedUser.value = user;
  emit("user-selected", user);
};



</script>

<style scoped>

.v-list-item {
  margin-top: 10px;
}

.avatar-wrapper {
  position: relative;
}

.avatar-decoration {
  position: absolute;
  top: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 48px;
  pointer-events: none;
  z-index: 2;
  object-fit: contain;
}

.status-badge {
  position: absolute;
  bottom: 0px;
  right: -2px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  z-index: 3;
}
</style>

