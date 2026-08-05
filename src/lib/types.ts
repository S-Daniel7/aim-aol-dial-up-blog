export type DbPost = {
  id: string;
  title: string;
  slug: string;
  blurb: string | null;
  my_handle: string | null;
  created_at: string;
};

export type DbMessage = {
  id: string;
  post_id: string;
  order_index: number;
  kind: "text" | "image";
  sender: string;
  time_label: string;
  body: string | null;
  image_url: string | null;
  image_caption: string | null;
};

export type LiveFeedEntry = {
  id: string;
  feed_number: number;
  body: string;
  image_url: string | null;
  created_at: string;
  tags: string[];
  is_pinned: boolean;
};

export type GuestbookEntry = {
  id: string;
  author_name: string;
  body: string;
  created_at: string;
};

export type AwayMessage = {
  body: string;
  updated_at: string;
};

export type NowPlaying = {
  track_title: string;
  artist_name: string;
  updated_at: string;
};

export type SiteCurrently = {
  reading: string | null;
  watching: string | null;
  listening: string | null;
  thinking: string | null;
  updated_at: string;
};

export type SiteMood = {
  mood: string;
  updated_at: string;
};

export type AskQuestion = {
  id: string;
  created_at: string;
  question: string;
  answer: string | null;
  answered_at: string | null;
  is_visible: boolean;
  is_featured: boolean;
};

export type BoardItem = {
  id: string;
  kind: "image" | "text";
  image_url: string | null;
  text: string | null;
  x: number;
  y: number;
  width: number;
  height: number | null;
  rotation: number;
  z_index: number;
  font_family: string | null;
  font_size: number | null;
  color: string | null;
  is_bold: boolean | null;
  is_italic: boolean | null;
  is_underline: boolean | null;
  created_at: string;
  updated_at: string;
};
