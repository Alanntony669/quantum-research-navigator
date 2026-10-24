import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
});

// AI Paper Navigator & Study Roadmap
export const getNavigatorSamples = async () => {
  const res = await api.get('/navigator/samples');
  return res.data;
};

export const getNavigatorSample = async (sampleId) => {
  const res = await api.get(`/navigator/sample/${sampleId}`);
  return res.data;
};

export const analyzePaperPdf = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await api.post('/navigator/analyze', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

// Papers & arXiv
export const searchPapers = async (
  query,
  start = 0,
  maxResults = 10,
  category = '',
  searchType = 'all'
) => {
  const params = { query, start, max_results: maxResults, search_type: searchType };
  if (category) params.category = category;
  const res = await api.get('/papers/search', { params });
  return res.data;
};

export const getTrending = async (category = 'quant-ph', maxResults = 6) => {
  const res = await api.get('/papers/trending', {
    params: { category, max_results: maxResults },
  });
  return res.data;
};

// Bookmarks
export const getBookmarks = async () => {
  const res = await api.get('/bookmarks');
  return res.data;
};

export const addBookmark = async (paper) => {
  const payload = {
    arxiv_id: paper.arxiv_id || paper.id,
    title: paper.title,
    authors: paper.authors || [],
    abstract: paper.abstract || '',
    pdf_link: paper.pdf_link || '',
    category: Array.isArray(paper.categories) && paper.categories.length > 0
      ? paper.categories[0]
      : (paper.category || 'quant-ph'),
  };
  const res = await api.post('/bookmarks', payload);
  return res.data;
};

export const removeBookmark = async (id) => {
  const res = await api.delete(`/bookmarks/${id}`);
  return res.data;
};

// Documents
export const getDocuments = async () => {
  const res = await api.get('/documents');
  return res.data;
};

export const uploadDocument = async (formData) => {
  const res = await api.post('/documents/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await api.delete(`/documents/${id}`);
  return res.data;
};

export const downloadDocumentUrl = (id) => `/api/documents/${id}/download`;

// Glossary
export const getGlossary = async () => {
  const res = await api.get('/glossary');
  return res.data;
};

export const searchGlossary = async (query) => {
  const res = await api.get('/glossary/search', {
    params: { q: query },
  });
  return res.data;
};

// Categories
export const getCategories = async () => {
  const res = await api.get('/categories');
  return res.data;
};

export default api;
