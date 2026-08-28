import { blogPosts } from "../data/catalog";

export const blogService = {
  async getPosts() {
    return blogPosts;
  },
  async getPost(slug: string) {
    return blogPosts.find((post) => post.slug === slug) ?? null;
  },
};
