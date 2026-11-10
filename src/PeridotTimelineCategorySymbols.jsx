/*
 * Peridot Timeline category symbols — researcher-curated Tabler Icons v3.50.0.
 *
 * The selectable vocabulary is exactly 100 distinct, researcher-approved
 * icons. Their names are stable Tabler icon IDs. Source rows and category
 * identities never change when a symbol is selected.
 *
 * Tabler Icons: Copyright (c) 2020-2026 Paweł Kuna and contributors.
 * MIT terms are included in core_documentation/TABLER_ICONS_LICENSE.md.
 * These React components are installed locally via the pinned
 * @tabler/icons-react@3.50.0 dependency; no runtime CDN access is used.
 *
 * Legacy Peridot-only symbol IDs are rendered but deliberately not offered
 * in the new selector; this preserves prior session configurations.
 */
import React from 'react';
import {
  IconCircle, IconSquare, IconTriangle, IconPentagon, IconHexagon,
  IconStar, IconFlower, IconSun, IconMoon, IconDiamond,
  IconBuildingChurch, IconBuildingMosque, IconKey, IconBook, IconBook2,
  IconSparkles, IconSkull, IconUser, IconUsersGroup, IconHeart,
  IconHearts, IconHome, IconBuildingCommunity, IconGenderFemale, IconGenderMale,
  IconGenderTransgender, IconWheelchair, IconStethoscope, IconFirstAidKit, IconMoodKid,
  IconCrown, IconFlag, IconBuildingBank, IconBuildingCastle, IconScale,
  IconGavel, IconShield, IconSwords, IconSpeakerphone,
  IconPeace, IconBiohazard, IconMapPin, IconCoins, IconBuildingStore, IconTool,
  IconPick, IconWheat, IconPlant, IconMoneybag, IconToolsKitchen2,
  IconCup, IconGlass, IconApple, IconCarrot, IconFish,
  IconMeat, IconCake, IconConfetti, IconGift, IconMusic,
  IconMasksTheater, IconDice, IconCards, IconTicket, IconPalette,
  IconPencil, IconBooks, IconMail, IconMessage, IconCamera,
  IconMovie, IconSchool, IconMicroscope, IconTelescope, IconBulb,
  IconLanguage, IconTrees, IconSeedling, IconMap, IconWind,
  IconCloud, IconCloudRain, IconCloudStorm, IconSnowflake, IconDroplet,
  IconPaw, IconHorse, IconBug, IconRecycle, IconAxe,
  IconTrash, IconRun, IconCompass, IconNorthStar, IconSailboat,
  IconAnchor, IconPlane, IconCar, IconBike, IconRoad,
} from '@tabler/icons-react';


export const TIMELINE_SYMBOL_GROUPS = Object.freeze([
  {label: "Geometric & abstract", symbols: [["circle", "Circle"], ["square", "Square"], ["triangle", "Triangle"], ["pentagon", "Pentagon"], ["hexagon", "Hexagon"], ["star", "Star"], ["flower", "Flower"], ["sun", "Sun"], ["moon", "Moon"], ["diamond", "Diamond"]]},
  {label: "Faith, ritual & belief", symbols: [["building-church", "Building Church"], ["building-mosque", "Building Mosque"], ["key", "Key"], ["book", "Book"], ["book-2", "Book 2"], ["sparkles", "Sparkles"], ["skull", "Skull"]]},
  {label: "Social life, kinship & identity", symbols: [["user", "User"], ["users-group", "Users Group"], ["heart", "Heart"], ["hearts", "Hearts"], ["home", "Home"], ["building-community", "Building Community"], ["gender-female", "Gender Female"], ["gender-male", "Gender Male"], ["gender-transgender", "Gender Transgender"], ["wheelchair", "Wheelchair"], ["stethoscope", "Stethoscope"], ["first-aid-kit", "First Aid Kit"], ["mood-kid", "Baby / child"]]},
  {label: "Political life, law & conflict", symbols: [["crown", "Crown"], ["flag", "Flag"], ["building-bank", "Building Bank"], ["building-castle", "Building Castle"], ["scale", "Scale"], ["gavel", "Gavel"], ["shield", "Shield"], ["swords", "Swords"], ["speakerphone", "Speakerphone"], ["biohazard", "Biohazard"], ["peace", "Peace"], ["map-pin", "Map Pin"]]},
  {label: "Economy, labor & material life", symbols: [["coins", "Coins"], ["building-store", "Building Store"], ["tool", "Tool"], ["pick", "Pick"], ["wheat", "Wheat"], ["plant", "Plant"], ["moneybag", "Moneybag"]]},
  {label: "Food, festivities & leisure", symbols: [["tools-kitchen-2", "Tools Kitchen 2"], ["cup", "Cup"], ["glass", "Glass"], ["apple", "Apple"], ["carrot", "Carrot"], ["fish", "Fish"], ["meat", "Meat"], ["cake", "Cake"], ["confetti", "Confetti"], ["gift", "Gift"], ["music", "Music"], ["masks-theater", "Masks Theater"], ["dice", "Dice"], ["cards", "Cards"], ["ticket", "Ticket"]]},
  {label: "Culture, knowledge & expression", symbols: [["palette", "Palette"], ["pencil", "Pencil"], ["books", "Books"], ["mail", "Mail"], ["message", "Message"], ["camera", "Camera"], ["movie", "Movie"], ["school", "School"], ["microscope", "Microscope"], ["telescope", "Telescope"], ["bulb", "Bulb"], ["language", "Language"]]},
  {label: "Environment, land & resources", symbols: [["trees", "Trees"], ["seedling", "Seedling"], ["map", "Map"], ["wind", "Wind"], ["cloud", "Cloud"], ["cloud-rain", "Cloud Rain"], ["cloud-storm", "Cloud Storm"], ["snowflake", "Snowflake"], ["droplet", "Droplet"], ["paw", "Paw"], ["horse", "Horse"], ["bug", "Bug"], ["recycle", "Recycle"], ["axe", "Axe"], ["trash", "Trash"]]},
  {label: "Travel, migration & built space", symbols: [["run", "Run"], ["compass", "Compass"], ["north-star", "North Star"], ["sailboat", "Sailboat"], ["anchor", "Anchor"], ["plane", "Plane"], ["car", "Car"], ["bike", "Bike"], ["road", "Road"]]},
]);
export const TIMELINE_SYMBOL_LABELS = Object.freeze({none: 'No symbol', ...Object.fromEntries(TIMELINE_SYMBOL_GROUPS.flatMap(group => group.symbols))});

const TABLER_COMPONENTS = Object.freeze({
  "circle": IconCircle,
  "square": IconSquare,
  "triangle": IconTriangle,
  "pentagon": IconPentagon,
  "hexagon": IconHexagon,
  "star": IconStar,
  "flower": IconFlower,
  "sun": IconSun,
  "moon": IconMoon,
  "diamond": IconDiamond,
  "building-church": IconBuildingChurch,
  "building-mosque": IconBuildingMosque,
  "key": IconKey,
  "book": IconBook,
  "book-2": IconBook2,
  "sparkles": IconSparkles,
  "skull": IconSkull,
  "user": IconUser,
  "users-group": IconUsersGroup,
  "heart": IconHeart,
  "hearts": IconHearts,
  "home": IconHome,
  "building-community": IconBuildingCommunity,
  "gender-female": IconGenderFemale,
  "gender-male": IconGenderMale,
  "gender-transgender": IconGenderTransgender,
  "wheelchair": IconWheelchair,
  "stethoscope": IconStethoscope,
  "first-aid-kit": IconFirstAidKit,
  "mood-kid": IconMoodKid,
  "crown": IconCrown,
  "flag": IconFlag,
  "building-bank": IconBuildingBank,
  "building-castle": IconBuildingCastle,
  "scale": IconScale,
  "gavel": IconGavel,
  "shield": IconShield,
  "swords": IconSwords,
  "speakerphone": IconSpeakerphone,
  "biohazard": IconBiohazard,
  "peace": IconPeace,
  "map-pin": IconMapPin,
  "coins": IconCoins,
  "building-store": IconBuildingStore,
  "tool": IconTool,
  "pick": IconPick,
  "wheat": IconWheat,
  "plant": IconPlant,
  "moneybag": IconMoneybag,
  "tools-kitchen-2": IconToolsKitchen2,
  "cup": IconCup,
  "glass": IconGlass,
  "apple": IconApple,
  "carrot": IconCarrot,
  "fish": IconFish,
  "meat": IconMeat,
  "cake": IconCake,
  "confetti": IconConfetti,
  "gift": IconGift,
  "music": IconMusic,
  "masks-theater": IconMasksTheater,
  "dice": IconDice,
  "cards": IconCards,
  "ticket": IconTicket,
  "palette": IconPalette,
  "pencil": IconPencil,
  "books": IconBooks,
  "mail": IconMail,
  "message": IconMessage,
  "camera": IconCamera,
  "movie": IconMovie,
  "school": IconSchool,
  "microscope": IconMicroscope,
  "telescope": IconTelescope,
  "bulb": IconBulb,
  "language": IconLanguage,
  "trees": IconTrees,
  "seedling": IconSeedling,
  "map": IconMap,
  "wind": IconWind,
  "cloud": IconCloud,
  "cloud-rain": IconCloudRain,
  "cloud-storm": IconCloudStorm,
  "snowflake": IconSnowflake,
  "droplet": IconDroplet,
  "paw": IconPaw,
  "horse": IconHorse,
  "bug": IconBug,
  "recycle": IconRecycle,
  "axe": IconAxe,
  "trash": IconTrash,
  "run": IconRun,
  "compass": IconCompass,
  "north-star": IconNorthStar,
  "sailboat": IconSailboat,
  "anchor": IconAnchor,
  "plane": IconPlane,
  "car": IconCar,
  "bike": IconBike,
  "road": IconRoad,
});

/** Draw around the center of a 24×24 SVG. Defaults to filled silhouettes. */
function LegacyPeridotCategorySymbolShape({name, color='currentColor'}) {
  const p={fill:color};
  switch(name) {
    case 'none': return <g stroke={color} strokeWidth="1.8" fill="none"><circle cx="12" cy="12" r="8.7"/><path d="M6 18L18 6" strokeWidth="2.3"/></g>;
    case 'circle': return <circle cx="12" cy="12" r="8" {...p}/>;
    case 'square': return <rect x="4" y="4" width="16" height="16" rx="1" {...p}/>;
    case 'triangle': return <path d="M12 3L22 21H2Z" {...p}/>;
    case 'diamond': return <path d="M12 2L22 12 12 22 2 12Z" {...p}/>;
    case 'star': return <path d="M12 2L14.9 8.7 22 9.2 16.5 13.8 18.3 21 12 17.2 5.7 21 7.5 13.8 2 9.2 9.1 8.7Z" {...p}/>;
    case 'hexagon': return <path d="M12 3L20 7.5V16.5L12 21 4 16.5V7.5Z" {...p}/>;
    case 'pentagon': return <path d="M12 2L22 9.3 18.2 21H5.8L2 9.3Z" {...p}/>;
    case 'cross': return <path d="M9 2H15V9H22V15H15V22H9V15H2V9H9Z" {...p}/>;
    case 'plus': return <path d="M11 3H13V11H21V13H13V21H11V13H3V11H11Z" {...p}/>;
    case 'crescent': return <path d="M16.5 2.5A9.5 9.5 0 1 0 17 21A8.5 8.5 0 0 1 16.5 2.5Z" {...p}/>;
    case 'flower': return <g {...p}>{[0,60,120,180,240,300].map(a=><ellipse key={a} cx="12" cy="7.6" rx="3.2" ry="5.2" transform={`rotate(${a} 12 12)`}/>)}<circle cx="12" cy="12" r="2" fill="#fffdf8"/></g>;
    case 'clover': return <g {...p}>{[[8,8],[16,8],[8,16],[16,16]].map(([x,y],i)=><circle key={i} cx={x} cy={y} r="5"/>)}</g>;
    case 'person': return <g {...p}><circle cx="12" cy="7" r="4"/><path d="M3 21C3 15 6.5 13 12 13S21 15 21 21Z"/></g>;
    case 'people': return <g {...p}><circle cx="8" cy="7" r="3.3"/><circle cx="16" cy="7" r="3.3"/><path d="M1 19Q2 12 8 12Q11 12 12 14Q13 12 16 12Q22 12 23 19V21H1Z"/></g>;
    case 'crown': return <path d="M2 7L7 12 12 4 17 12 22 7 20 19H4Z M4 20H20V22H4Z" {...p}/>;
    case 'heart': return <path d="M12 21L3.1 12.4C-1 7.8 5.4 1 12 7.3C18.6 1 25 7.8 20.9 12.4Z" {...p}/>;
    case 'shield': return <path d="M12 2L21 5V11Q21 18 12 22Q3 18 3 11V5Z" {...p}/>;
    case 'handshake': return <g {...p}><path d="M2 9L7 5 12 7 9 10Q9 13 12 11L15 9 22 13 19 17 15 20 12 18 10 20 7 17 4 15Z"/><path d="M15 5L22 8 19 11 15 9 12 11 10 9 13 6Z"/></g>;
    case 'flag': return <g {...p}><rect x="4" y="2" width="2" height="20"/><path d="M6 3Q12 0 19 4L21 12Q14 9 6 13Z"/></g>;
    case 'letter': return <g {...p}><rect x="2" y="5" width="20" height="15" rx="2"/><path d="M3 6L12 13 21 6" stroke="#fffdf8" strokeWidth="1.4" fill="none"/></g>;
    case 'book': return <g {...p}><path d="M12 6Q7 2 2 4V19Q8 17 12 21Q16 17 22 19V4Q17 2 12 6Z"/><path d="M12 6V20" stroke="#fffdf8" strokeWidth="1.5"/></g>;
    case 'scroll': return <g {...p}><path d="M5 2H19Q22 2 22 6V18Q22 21 18 21H6Q2 21 2 17Q2 14 5 14V5Q5 3 7 3"/><path d="M7 8H18M7 12H17" stroke="#fffdf8" strokeWidth="1.4"/></g>;
    case 'feather': return <g {...p}><path d="M20 2Q7 2 4 14Q9 14 12 18Q22 13 20 2Z"/><path d="M3 22L15 7" stroke={color} strokeWidth="2" strokeLinecap="round"/></g>;
    case 'pen': return <path d="M3 17L16 4 20 8 7 21 2 22Z M17 3L19 1 23 5 21 7Z" {...p}/>;
    case 'speech': return <path d="M3 3H21V17H12L6 22V17H3Z" {...p}/>;
    case 'home': return <path d="M2 11L12 2 22 11H19V22H5V11Z" {...p}/>;
    case 'landmark': return <g {...p}><path d="M12 2L23 8H1Z M2 20H22V22H2Z"/><rect x="4" y="10" width="3" height="9"/><rect x="10.5" y="10" width="3" height="9"/><rect x="17" y="10" width="3" height="9"/></g>;
    case 'church': return <path d="M10 2H14V6H18V10H22V22H2V10H6V6H10Z M11 11V17H13V11Z" {...p}/>;
    case 'ship': return <g {...p}><path d="M2 15L22 15 18 21H7Z M11 2H13V14H11Z M10 4L3 13H10Z M14 5L21 13H14Z"/></g>;
    case 'anchor': return <g stroke={color} strokeWidth="2.5" strokeLinecap="round" fill="none"><circle cx="12" cy="4" r="2.2"/><path d="M12 7V21M5 11H19M3 16Q4 22 12 22Q20 22 21 16M3 16L1 18M21 16L23 18"/></g>;
    case 'compass': return <g {...p}><circle cx="12" cy="12" r="10"/><path d="M8 16L11 9 16 8 13 15Z" fill="#fffdf8"/></g>;
    case 'pin': return <path d="M12 23Q3 13 3 10A9 9 0 0 1 21 10Q21 13 12 23Z M12 6A4 4 0 1 0 12 14A4 4 0 1 0 12 6" fillRule="evenodd" {...p}/>;
    case 'globe': return <g stroke={color} fill="none" strokeWidth="2"><circle cx="12" cy="12" r="9.5"/><ellipse cx="12" cy="12" rx="4.5" ry="9.5"/><path d="M3 12H21M5 7H19M5 17H19"/></g>;
    case 'scales': return <g {...p}><path d="M11 3H13V19H11Z M5 5H19V7H5Z M8 19H16V21H8Z M3 11L7 8 11 11 7 16Z M13 11L17 8 21 11 17 16Z"/></g>;
    case 'coins': return <g {...p}><ellipse cx="9" cy="6" rx="7" ry="3.5"/><path d="M2 6V12Q9 18 16 12V6Z"/><ellipse cx="16" cy="15" rx="6" ry="3"/><path d="M10 15V19Q16 24 22 19V15Z"/></g>;
    case 'wheat': return <g {...p}><path d="M11 22H13V4H11Z"/>{[5,9,13,17].map(y=><g key={y}><ellipse cx="8" cy={y} rx="3" ry="2" transform={`rotate(30 8 ${y})`}/><ellipse cx="16" cy={y} rx="3" ry="2" transform={`rotate(-30 16 ${y})`}/></g>)}</g>;
    case 'swords': return <g {...p}><path d="M3 2L11 10 9 12 2 4Z M21 2L13 10 15 12 22 4Z M5 16L16 5 19 8 8 19Z M19 16L8 5 5 8 16 19Z"/></g>;
    case 'flask': return <path d="M9 2H15V4H14V10L21 20Q22 22 19 22H5Q2 22 3 20L10 10V4H9Z" {...p}/>;
    case 'music': return <g {...p}><path d="M10 3L20 1V17H17V7L12 8V19H9Z"/><ellipse cx="7.5" cy="19" rx="4.5" ry="3"/><ellipse cx="17" cy="17" rx="4.5" ry="3"/></g>;
    case 'tree': return <g {...p}><path d="M11 13H13V22H11Z"/><circle cx="12" cy="8" r="7"/><circle cx="6" cy="11" r="5"/><circle cx="18" cy="11" r="5"/></g>;
    case 'leaf': return <g {...p}><path d="M21 3Q5 2 3 15Q5 21 11 21Q22 18 21 3Z"/><path d="M5 20L17 7" stroke="#fffdf8" strokeWidth="1.5"/></g>;
    case 'sun': return <g {...p}><circle cx="12" cy="12" r="5.5"/>{Array.from({length:8},(_,i)=><rect key={i} x="11" y="1" width="2" height="4" rx="1" transform={`rotate(${i*45} 12 12)`}/>)}</g>;
    case 'hourglass': return <path d="M4 2H20V4H18Q17 9 13 12Q17 15 18 20H20V22H4V20H6Q7 15 11 12Q7 9 6 4H4Z" {...p}/>;
    case 'key': return <g {...p}><circle cx="7" cy="9" r="6"/><path d="M10 12L22 22 22 18 19 18 19 15 16 15 13 12Z"/></g>;
    case 'mountain': return <path d="M1 21L9 5 13 12 16 8 23 21Z" {...p}/>;
    default: return null;
  }
}


/**
 * Render Tabler's true 24x24 SVG inside the existing Timeline SVG mark.
 * Because marks and previews both call this component, their symbol artwork
 * and contrast match exactly. Thin strokes are slightly strengthened at 38px.
 * Unrecognized legacy IDs use the previous Peridot geometry (if available).
 */
export function PeridotCategorySymbolShape({name, color='currentColor'}) {
  if (name === 'none') return <LegacyPeridotCategorySymbolShape name="none" color={color}/>;
  // Existing session-only selections using the retired IDs keep their meaning
  // until their owners choose a replacement in the selector.
  const legacyAlias = {'building-temple':'key','hands-clapping':'skull','hand-fist':'biohazard'};
  const Icon = TABLER_COMPONENTS[legacyAlias[name] || name];
  if (Icon) return <Icon size={24} stroke={2.6} color={color} aria-hidden="true" focusable="false"/>;
  return <LegacyPeridotCategorySymbolShape name={name} color={color}/>;
}

export function PeridotCategorySymbolIcon({name, color='currentColor', size=24}) {
  return <svg aria-hidden="true" focusable="false" width={size} height={size} viewBox="0 0 24 24">
    <PeridotCategorySymbolShape name={name} color={color}/>
  </svg>;
}
