<template>
  <v-container>
    <v-row justify="center">
      <v-col cols="12" md="8">
        <h1>{{ $t("pages.tags.index.title") }}</h1>
      </v-col>
    </v-row>

    <LoadingContainer v-if="isLoading" />

    <v-container v-else>
      <v-row justify="center" class="tag-container">
        <v-col v-for="tag in tags" :key="tag.slug" cols="auto" class="my-2">
          <NuxtLink :to="localPath(`/tags/${tag.slug}`)" class="tag-link" v-if="tag.articleCount > 0">
            {{ tag.name }}
            <v-chip class="ma-1" size="small" color="white">
              {{ tag.articleCount }}
            </v-chip>
          </NuxtLink>
        </v-col>
      </v-row>
    </v-container>
  </v-container>
</template>

<script setup>
const localPath = useLocalePath();
const { getAllTags, getCountArticleByTag } = useDb();
const isLoading = ref(true);
const authStore = useAuthStore();
const tags = ref([]);

useSeoI18nMeta("tags.index");
onMounted(async () => {
  authStore.checkAuth();
  const rawTags = await getAllTags();

  const tagsWithCounts = await Promise.all(
    rawTags.map(async (tag) => {
      const count = await getCountArticleByTag(tag.id);
      return { ...tag, articleCount: count };
    })
  );

  tags.value = tagsWithCounts;
  isLoading.value = false;
});
</script>

<style scoped>


.page-title {
  font-family: "Poppins", sans-serif;
  font-weight: 700;
  font-size: 2.8rem;
  text-align: center;
  margin-top: 2rem;
  margin-bottom: 2.5rem;
  color: #1f1f1f;
}

.tag-container {
  flex-wrap: wrap;
  max-width: 900px;
  margin: 0 auto;
}

.tag-link {
  display: inline-block;
  padding: 10px 18px;
  background-color: #4a148c;
  color: #ede7f6;
  border: 1px solid #d1c4e9;
  border-radius: 999px;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.2s ease;
  text-decoration: none;
}

.tag-link:hover {
  background-color: #d1c4e9;
  color: #4a148c;
}
</style>
