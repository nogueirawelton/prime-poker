export type Faq = {
  title: string;
  questions: Array<{
    answer: string;
    title: string;
  }>;
};

export type BePart = {
  title: string;
  description: string;
  steps: Array<{ step: string }>;
};

export type Evolution = {
  title: string;
  description: string;
  accumulatedEarnings: Array<{ title: string; amount: string }>;
  successStories: {
    nodes: Array<{
      title: string;
      featuredImage: { node: { mediaItemUrl: string } };
      testimonialFields: {
        testimonial: string;
        earnings: string;
      };
    }>;
  };
};

export type Instructors = {
  title: string;
  description: string;
  instructors: {
    nodes: Array<{
      title: string;
      featuredImage: {
        node: {
          mediaItemUrl: string;
        };
      };
      tags: {
        nodes: Array<{
          name: string;
        }>;
      };
    }>;
  };
};

export type HeadCoachs = {
  title: string;
  description: string;
  coachs: {
    nodes: Array<{
      title: string;
      featuredImage: {
        node: {
          mediaItemUrl: string;
        };
      };
      tags: {
        nodes: Array<{
          name: string;
        }>;
      };
      instructorFields: {
        earnings: string;
        description: string;
      };
    }>;
  };
};

export type WhatWeDo = {
  title: string;
  description: string;

  feature: Array<{
    title: string;
    icon: string;
    description: string;
  }>;

  structure: {
    title: string;
    items: Array<{ item: string }>;
  };
};

export type WhoWeAre = {
  title: string;
  description: string;
  mission: string;
  vision: string;
  values: string;
  players: string;
  earnings: string;
  years: string;
};

export type Home = {
  page: {
    homeFields: {
      faq: Faq;
      bePart: BePart;
      evolution: Evolution;
      instructors: Instructors;
      headCoaches: HeadCoachs;
      whatWeDo: WhatWeDo;
      whoWeAre: WhoWeAre;
    };
  };
};
