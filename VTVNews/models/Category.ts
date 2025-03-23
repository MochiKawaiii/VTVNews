// Category interface
export interface Category {
  id: string;
  name: string;
  slug: string;
  displayOrder: number;
}

// Available categories
export const categories: Category[] = [
  {
    id: 'general',
    name: 'Thời sự',
    slug: 'thoi-su',
    displayOrder: 1
  },
  {
    id: 'business',
    name: 'Kinh tế',
    slug: 'kinh-te',
    displayOrder: 2
  },
  {
    id: 'politics',
    name: 'Chính trị',
    slug: 'chinh-tri',
    displayOrder: 3
  },
  {
    id: 'entertainment',
    name: 'Giải trí',
    slug: 'giai-tri',
    displayOrder: 4
  },
  {
    id: 'health',
    name: 'Sức khỏe',
    slug: 'suc-khoe',
    displayOrder: 5
  },
  {
    id: 'science',
    name: 'Khoa học',
    slug: 'khoa-hoc',
    displayOrder: 6
  },
  {
    id: 'sports',
    name: 'Thể thao',
    slug: 'the-thao',
    displayOrder: 7
  },
  {
    id: 'technology',
    name: 'Công nghệ',
    slug: 'cong-nghe',
    displayOrder: 8
  },
  {
    id: 'world',
    name: 'Thế giới',
    slug: 'the-gioi',
    displayOrder: 9
  }
];

// Function to get category by ID
export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(category => category.id === id);
};

// Function to get category by slug
export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find(category => category.slug === slug);
};
