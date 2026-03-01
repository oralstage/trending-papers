export const OPENALEX_MAILTO = 'k.shinokita@gmail.com';

export interface Subfield {
  id: number;
  name: string;
}

export interface FieldGroup {
  fieldId: number;
  label: string;
  subfields: Subfield[];
}

export const FIELD_GROUPS: FieldGroup[] = [
  {
    fieldId: 31,
    label: 'Physics & Astronomy',
    subfields: [
      { id: 3104, name: 'Condensed Matter Physics' },
      { id: 3107, name: 'Atomic and Molecular Physics, and Optics' },
      { id: 3106, name: 'Nuclear and High Energy Physics' },
      { id: 3103, name: 'Astronomy and Astrophysics' },
      { id: 3109, name: 'Statistical and Nonlinear Physics' },
      { id: 3108, name: 'Radiation' },
      { id: 3105, name: 'Instrumentation' },
      { id: 3102, name: 'Acoustics and Ultrasonics' },
    ],
  },
  {
    fieldId: 16,
    label: 'Chemistry',
    subfields: [
      { id: 1605, name: 'Organic Chemistry' },
      { id: 1604, name: 'Inorganic Chemistry' },
      { id: 1606, name: 'Physical and Theoretical Chemistry' },
      { id: 1602, name: 'Analytical Chemistry' },
      { id: 1603, name: 'Electrochemistry' },
      { id: 1607, name: 'Spectroscopy' },
    ],
  },
  {
    fieldId: 25,
    label: 'Materials Science',
    subfields: [
      { id: 2505, name: 'Materials Chemistry' },
      { id: 2504, name: 'Electronic, Optical and Magnetic Materials' },
      { id: 2507, name: 'Polymers and Plastics' },
      { id: 2508, name: 'Surfaces, Coatings and Films' },
      { id: 2506, name: 'Metals and Alloys' },
      { id: 2503, name: 'Ceramics and Composites' },
      { id: 2502, name: 'Biomaterials' },
      { id: 2500, name: 'General Materials Science' },
    ],
  },
  {
    fieldId: 17,
    label: 'Computer Science',
    subfields: [
      { id: 1702, name: 'Artificial Intelligence' },
      { id: 1707, name: 'Computer Vision and Pattern Recognition' },
      { id: 1705, name: 'Computer Networks and Communications' },
      { id: 1710, name: 'Information Systems' },
      { id: 1703, name: 'Computational Theory and Mathematics' },
      { id: 1706, name: 'Computer Science Applications' },
      { id: 1711, name: 'Signal Processing' },
      { id: 1708, name: 'Hardware and Architecture' },
      { id: 1709, name: 'Human-Computer Interaction' },
      { id: 1704, name: 'Computer Graphics and Computer-Aided Design' },
      { id: 1712, name: 'Software' },
    ],
  },
  {
    fieldId: 13,
    label: 'Biochemistry & Molecular Biology',
    subfields: [
      { id: 1312, name: 'Molecular Biology' },
      { id: 1311, name: 'Genetics' },
      { id: 1304, name: 'Biophysics' },
      { id: 1307, name: 'Cell Biology' },
      { id: 1303, name: 'Biochemistry' },
      { id: 1305, name: 'Biotechnology' },
      { id: 1306, name: 'Cancer Research' },
      { id: 1315, name: 'Structural Biology' },
      { id: 1309, name: 'Developmental Biology' },
      { id: 1314, name: 'Physiology' },
      { id: 1310, name: 'Endocrinology' },
      { id: 1308, name: 'Clinical Biochemistry' },
      { id: 1313, name: 'Molecular Medicine' },
      { id: 1302, name: 'Aging' },
    ],
  },
  {
    fieldId: 26,
    label: 'Mathematics',
    subfields: [
      { id: 2604, name: 'Applied Mathematics' },
      { id: 2610, name: 'Mathematical Physics' },
      { id: 2613, name: 'Statistics and Probability' },
      { id: 2611, name: 'Modeling and Simulation' },
      { id: 2608, name: 'Geometry and Topology' },
      { id: 2602, name: 'Algebra and Number Theory' },
      { id: 2612, name: 'Numerical Analysis' },
      { id: 2607, name: 'Discrete Mathematics and Combinatorics' },
      { id: 2605, name: 'Computational Mathematics' },
      { id: 2614, name: 'Theoretical Computer Science' },
    ],
  },
  {
    fieldId: 19,
    label: 'Earth & Planetary Sciences',
    subfields: [
      { id: 1908, name: 'Geophysics' },
      { id: 1902, name: 'Atmospheric Science' },
      { id: 1910, name: 'Oceanography' },
      { id: 1907, name: 'Geology' },
      { id: 1906, name: 'Geochemistry and Petrology' },
      { id: 1904, name: 'Earth-Surface Processes' },
      { id: 1912, name: 'Space and Planetary Science' },
      { id: 1911, name: 'Paleontology' },
    ],
  },
];

export interface Publisher {
  id: string;
  name: string;
  domain: string;
}

export const PUBLISHERS: Publisher[] = [
  { id: 'P4310319965', name: 'Springer Nature', domain: 'nature.com' },
  { id: 'P4310320990', name: 'Elsevier', domain: 'sciencedirect.com' },
  { id: 'P4310320595', name: 'Wiley', domain: 'wiley.com' },
  { id: 'P4310320261', name: 'American Physical Society', domain: 'journals.aps.org' },
  { id: 'P4310320006', name: 'American Chemical Society', domain: 'pubs.acs.org' },
  { id: 'P4310315823', name: 'AAAS (Science)', domain: 'science.org' },
  { id: 'P4310320083', name: 'IOP Publishing', domain: 'iopscience.iop.org' },
  { id: 'P4310320556', name: 'Royal Society of Chemistry', domain: 'pubs.rsc.org' },
  { id: 'P4310319808', name: 'IEEE', domain: 'ieeexplore.ieee.org' },
  { id: 'P4310320547', name: 'Taylor & Francis', domain: 'tandfonline.com' },
  { id: 'P4310311648', name: 'Oxford University Press', domain: 'academic.oup.com' },
  { id: 'P4310320052', name: 'National Academy of Sciences', domain: 'pnas.org' },
];

// Default: Condensed Matter Physics
export const DEFAULT_SUBFIELD_IDS = [3104];

export const DEFAULT_WINDOW_MONTHS = 12;
