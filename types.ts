
export interface Plan {
  name: 'Free' | 'Standard' | 'Premium';
  price: string;
  priceDetails: string;
  features: string[];
  cta: string;
  isPopular?: boolean;
}

export interface Page {
  page_number: number;
  text: string;
  illustration_prompt: string;
  imageUrl?: string;
}

export interface Book {
  title: string;
  cover_illustration_prompt: string;
  coverImageUrl?: string;
  pages: Page[];
}
