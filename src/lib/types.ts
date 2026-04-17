export type DbPost = {
  id: string;
  title: string;
  slug: string;
  blurb: string | null;
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
};
