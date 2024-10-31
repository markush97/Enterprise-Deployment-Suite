import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

interface WikiArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

interface WikiState {
  articles: WikiArticle[];
  addArticle: (article: Omit<WikiArticle, 'id'>) => void;
  updateArticle: (id: string, article: Partial<WikiArticle>) => void;
  deleteArticle: (id: string) => void;
}

export const useWikiStore = create<WikiState>((set) => ({
  articles: [],
  
  addArticle: (article) => set((state) => ({
    articles: [...state.articles, { ...article, id: uuidv4() }],
  })),
  
  updateArticle: (id, article) => set((state) => ({
    articles: state.articles.map((a) => 
      a.id === id ? { ...a, ...article, updatedAt: new Date().toISOString() } : a
    ),
  })),
  
  deleteArticle: (id) => set((state) => ({
    articles: state.articles.filter((a) => a.id !== id),
  })),
}));