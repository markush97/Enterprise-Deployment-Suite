import { v4 as uuidv4 } from 'uuid';

export interface Tag {
  id: string;
  title: string;
  icon: string;
  color: string;
}

export interface Article {
  id: string;
  title: string;
  content: string;
  category: string;
  tagIds: string[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateTagInput {
  title: string;
  icon: string;
  color: string;
}

export interface CreateArticleInput {
  title: string;
  content: string;
  category: string;
  tagIds: string[];
}

export const createTag = (input: CreateTagInput): Tag => ({
  id: uuidv4(),
  ...input,
});

export const createArticle = (input: CreateArticleInput): Article => ({
  id: uuidv4(),
  ...input,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});