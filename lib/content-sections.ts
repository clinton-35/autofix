export type SectionDef = {
  key: string;
  group: "Homepage" | "About Us page";
  title: string;
  headingLabel: string;
  descriptionLabel?: string; // no label = no description field
  image?: string; // label shown for the photo, if the section has one
  hint?: string;
};

export const GROUPS = ["Homepage", "About Us page"] as const;

export const SECTIONS: SectionDef[] = [
  {
    key: "promotion",
    group: "Homepage",
    title: "Promotion banner",
    headingLabel: "Promotion title",
    descriptionLabel: "Details",
    hint: "Leave the title empty to hide the banner.",
  },
  {
    key: "home_hero",
    group: "Homepage",
    title: "Hero (top of the homepage)",
    headingLabel: "Headline",
    descriptionLabel: "Supporting text",
    image: "Large background photo",
    hint: "A wide, landscape photo works best.",
  },
  {
    key: "home_intro",
    group: "Homepage",
    title: "Introduction",
    headingLabel: "Heading",
    descriptionLabel: "Introduction text",
  },
  {
    key: "home_expertise",
    group: "Homepage",
    title: "Automotive expertise",
    headingLabel: "Heading",
    descriptionLabel: "Short description",
    image: "Photo of a technician or vehicle",
  },
  {
    key: "home_cta",
    group: "Homepage",
    title: "Booking call to action",
    headingLabel: "Heading",
  },
  {
    key: "about_history",
    group: "About Us page",
    title: "Our story",
    headingLabel: "Heading",
    descriptionLabel: "Garage background and history",
    image: "Workshop photo",
  },
  {
    key: "about_mission",
    group: "About Us page",
    title: "Mission and values",
    headingLabel: "Heading",
    descriptionLabel: "Mission and values text",
  },
  {
    key: "about_team",
    group: "About Us page",
    title: "Team",
    headingLabel: "Heading",
    descriptionLabel: "Team information",
    image: "Team photo",
  },
];