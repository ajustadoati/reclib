export type Category = "Books" | "Movies" | "Series" | "TV" | "Music" | "Podcasts" | "Links" | "Kids" | "Other";

export type Platform = 
  | "Netflix"
  | "HBO Max"
  | "Apple TV+"
  | "Disney+"
  | "Amazon Prime"
  | "Hulu"
  | "Paramount+"
  | "Peacock"
  | "Spotify"
  | "Apple Music"
  | "YouTube"
  | "Goodreads"
  | "Amazon Books"
  | "Apple Podcasts"
  | "IMDb"
  | "Letterboxd"
  | "Medium"
  | "Substack"
  | "Reddit"
  | "Twitter"
  | "News"
  | "Blog"
  | "Website"
  | "Other";

export interface Recommendation {
  id: string;
  title: string;
  category: Category;
  platforms: Platform[];
  notes?: string;
  platformUrl?: string;
  imageUri?: string;
  createdAt: number;
  updatedAt: number;
}

export interface AIRecognitionResult {
  title: string;
  category: Category;
  platform?: Platform;
  author?: string;
  platformUrl?: string;
  confidence: number;
}

export const CATEGORIES: Category[] = ["Books", "Movies", "Series", "TV", "Music", "Podcasts", "Links", "Kids", "Other"];

export const PLATFORMS: Platform[] = [
  "Netflix",
  "HBO Max",
  "Apple TV+",
  "Disney+",
  "Amazon Prime",
  "Hulu",
  "Paramount+",
  "Peacock",
  "Spotify",
  "Apple Music",
  "YouTube",
  "Goodreads",
  "Amazon Books",
  "Apple Podcasts",
  "IMDb",
  "Letterboxd",
  "Medium",
  "Substack",
  "Reddit",
  "Twitter",
  "News",
  "Blog",
  "Website",
  "Other",
];

export const PLATFORM_BY_CATEGORY: Record<Category, Platform[]> = {
  Books: ["Goodreads", "Amazon Books", "Other"],
  Movies: ["Netflix", "HBO Max", "Apple TV+", "Disney+", "Amazon Prime", "Hulu", "Paramount+", "Peacock", "IMDb", "Letterboxd", "YouTube", "Other"],
  Series: ["Netflix", "HBO Max", "Apple TV+", "Disney+", "Amazon Prime", "Hulu", "Paramount+", "Peacock", "Other"],
  TV: ["Netflix", "HBO Max", "Apple TV+", "Disney+", "Amazon Prime", "Hulu", "Paramount+", "Peacock", "YouTube", "Other"],
  Music: ["Spotify", "Apple Music", "YouTube", "Other"],
  Podcasts: ["Spotify", "Apple Podcasts", "YouTube", "Other"],
  Links: ["Medium", "Substack", "Reddit", "Twitter", "News", "Blog", "Website", "YouTube", "Other"],
  Kids: ["Netflix", "Disney+", "Amazon Prime", "YouTube", "Apple TV+", "Paramount+", "Peacock", "Other"],
  Other: ["Other"],
};

export const PLATFORM_URLS: Record<Platform, string> = {
  "Netflix": "https://www.netflix.com/search?q=",
  "HBO Max": "https://www.max.com/search?q=",
  "Apple TV+": "https://tv.apple.com/search?term=",
  "Disney+": "https://www.disneyplus.com/search?q=",
  "Amazon Prime": "https://www.amazon.com/s?k=",
  "Hulu": "https://www.hulu.com/search?q=",
  "Paramount+": "https://www.paramountplus.com/search/?q=",
  "Peacock": "https://www.peacocktv.com/search?q=",
  "Spotify": "https://open.spotify.com/search/",
  "Apple Music": "https://music.apple.com/search?term=",
  "YouTube": "https://www.youtube.com/results?search_query=",
  "Goodreads": "https://www.goodreads.com/search?q=",
  "Amazon Books": "https://www.amazon.com/s?i=stripbooks&k=",
  "Apple Podcasts": "https://podcasts.apple.com/search?term=",
  "IMDb": "https://www.imdb.com/find?q=",
  "Letterboxd": "https://letterboxd.com/search/",
  "Medium": "https://medium.com/search?q=",
  "Substack": "https://substack.com/search/",
  "Reddit": "https://www.reddit.com/search/?q=",
  "Twitter": "https://twitter.com/search?q=",
  "News": "https://news.google.com/search?q=",
  "Blog": "https://www.google.com/search?q=",
  "Website": "https://www.google.com/search?q=",
  "Other": "https://www.google.com/search?q=",
};

export function generateSmartLink(title: string, platform: Platform): string {
  const baseUrl = PLATFORM_URLS[platform] || PLATFORM_URLS.Other;
  const encodedTitle = encodeURIComponent(title);
  return `${baseUrl}${encodedTitle}`;
}

export function getDefaultPlatform(category: Category): Platform {
  const platforms = PLATFORM_BY_CATEGORY[category];
  return platforms[0];
}

// Translations
export type Language = "en" | "es";

export const TRANSLATIONS: Record<Language, Record<string, string>> = {
  en: {
    // Navigation
    "nav.library": "Library",
    "nav.categories": "Categories",
    "nav.settings": "Settings",
    
    // Categories
    "category.Books": "Books",
    "category.Movies": "Movies",
    "category.Series": "Series",
    "category.TV": "TV",
    "category.Music": "Music",
    "category.Podcasts": "Podcasts",
    "category.Links": "Links",
    "category.Kids": "Kids",
    "category.Other": "Other",
    
    // Platforms
    "platform.Netflix": "Netflix",
    "platform.HBO Max": "HBO Max",
    "platform.Apple TV+": "Apple TV+",
    "platform.Disney+": "Disney+",
    "platform.Amazon Prime": "Amazon Prime",
    "platform.Hulu": "Hulu",
    "platform.Paramount+": "Paramount+",
    "platform.Peacock": "Peacock",
    "platform.Spotify": "Spotify",
    "platform.Apple Music": "Apple Music",
    "platform.YouTube": "YouTube",
    "platform.Goodreads": "Goodreads",
    "platform.Amazon Books": "Amazon Books",
    "platform.Apple Podcasts": "Apple Podcasts",
    "platform.IMDb": "IMDb",
    "platform.Letterboxd": "Letterboxd",
    "platform.Medium": "Medium",
    "platform.Substack": "Substack",
    "platform.Reddit": "Reddit",
    "platform.Twitter": "Twitter",
    "platform.News": "News",
    "platform.Blog": "Blog",
    "platform.Website": "Website",
    "platform.Other": "Other",
    
    // Common
    "common.save": "Save",
    "common.cancel": "Cancel",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.share": "Share",
    "common.search": "Search",
    "common.add": "Add",
    "common.saved": "saved",
    "common.justNow": "Just now",
    "common.ago": "ago",
    
    // Time
    "time.m": "m",
    "time.h": "h",
    "time.d": "d",
    "time.w": "w",
    "time.mo": "mo",
    "time.y": "y",
    
    // Library
    "library.title": "RecLib",
    "library.empty.title": "No recommendations yet",
    "library.empty.subtitle": "Tap + to save your first",
    "library.search.placeholder": "Search recommendations...",
    "library.search.empty": "No results found",
    
    // Categories
    "categories.title": "Categories",
    "categories.empty.title": "Nothing saved yet",
    "categories.empty.subtitle": "Start adding recommendations to see them organized here",
    
    // Add Recommendation
    "add.title": "Add Recommendation",
    "add.shared.title": "Save Shared Link",
    "add.edit.title": "Edit Recommendation",
    "add.choose.title": "How would you like to add?",
    "add.scan.title": "Scan Image",
    "add.scan.subtitle": "Take a photo or pick from gallery",
    "add.manual.title": "Enter Manually",
    "add.manual.subtitle": "Type in the details yourself",
    "add.camera.title": "Take Photo",
    "add.camera.subtitle": "Capture a screenshot or book cover",
    "add.processing": "Analyzing image...",
    "add.found": "Found it!",
    "add.useThis": "Use This",
    "add.field.title": "Title",
    "add.field.title.placeholder": "e.g., The Great Gatsby",
    "add.field.category": "Category",
    "add.field.platform": "Platform",
    "add.field.notes": "Notes (optional)",
    "add.field.notes.placeholder": "Why was this recommended? Any thoughts?",
    "add.field.url": "Platform URL (optional)",
    "add.field.url.hint": "Leave empty to auto-generate a search link",

    // AI Scan Limits
    "ai.scansRemaining": "scans remaining",
    "ai.freeVersion": "Test version",
    "ai.limitReached.title": "Scan limit reached",
    "ai.limitReached.message": "You've used all 3 free AI scans in this version. You can still add recommendations manually.",
    "ai.scanInfo": "In this Test version, you have {remaining} of {total} AI scans available.",

    // Detail
    "detail.title": "Details",
    "detail.openOn": "Open on",
    "detail.notes": "Notes",
    "detail.added": "Added",
    "detail.modified": "Modified",
    "detail.delete.title": "Delete Recommendation",
    "detail.delete.message": "Are you sure you want to delete this?",
    
    // Share
    "share.checkOut": "Check out",
    "share.openIn": "Open in RecLib",
    "share.copied": "Link copied to clipboard!",
    "share.uploading": "Creating share link...",
    "share.failed": "Failed to create share link",
    
    // Import
    "import.title": "Shared Recommendation",
    "import.sharedWithYou": "Shared with you",
    "import.addToLibrary": "Add to My Library",
    "import.importing": "Adding...",
    "import.success": "Added!",
    "import.successMessage": "The recommendation was added to your library.",
    "import.notFound": "This recommendation was not found or has expired.",
    "import.error": "Failed to load the shared recommendation.",
    "import.importError": "Failed to add to your library.",
    
    // Common
    "common.loading": "Loading...",
    "common.goBack": "Go Back",
    "common.error": "Error",
    
    // Settings
    "settings.title": "Settings",
    "settings.profile": "Profile",
    "settings.displayName": "Display Name",
    "settings.preferences": "Preferences",
    "settings.defaultCategory": "Default Category",
    "settings.sortOrder": "Sort Order",
    "settings.sort.recent": "Most Recent",
    "settings.sort.alphabetical": "A-Z",
    "settings.sort.category": "By Category",
    "settings.language": "Language",
    "settings.about": "About",
    "settings.version": "Version",
    "settings.total": "Total Recommendations",
    "settings.privacy": "Privacy Policy",
    "settings.terms": "Terms of Service",
    "settings.footer": "RecLib",
    "settings.footerSub": "Your personal curator's notebook",
  },
  es: {
    // Navigation
    "nav.library": "Biblioteca",
    "nav.categories": "Categorías",
    "nav.settings": "Ajustes",
    
    // Categories
    "category.Books": "Libros",
    "category.Movies": "Películas",
    "category.Series": "Series",
    "category.TV": "TV",
    "category.Music": "Música",
    "category.Podcasts": "Podcasts",
    "category.Links": "Enlaces",
    "category.Kids": "Niños",
    "category.Other": "Otro",
    
    // Platforms
    "platform.Netflix": "Netflix",
    "platform.HBO Max": "HBO Max",
    "platform.Apple TV+": "Apple TV+",
    "platform.Disney+": "Disney+",
    "platform.Amazon Prime": "Amazon Prime",
    "platform.Hulu": "Hulu",
    "platform.Paramount+": "Paramount+",
    "platform.Peacock": "Peacock",
    "platform.Spotify": "Spotify",
    "platform.Apple Music": "Apple Music",
    "platform.YouTube": "YouTube",
    "platform.Goodreads": "Goodreads",
    "platform.Amazon Books": "Amazon Books",
    "platform.Apple Podcasts": "Apple Podcasts",
    "platform.IMDb": "IMDb",
    "platform.Letterboxd": "Letterboxd",
    "platform.Medium": "Medium",
    "platform.Substack": "Substack",
    "platform.Reddit": "Reddit",
    "platform.Twitter": "Twitter",
    "platform.News": "Noticias",
    "platform.Blog": "Blog",
    "platform.Website": "Sitio Web",
    "platform.Other": "Otro",
    
    // Common
    "common.save": "Guardar",
    "common.cancel": "Cancelar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.share": "Compartir",
    "common.search": "Buscar",
    "common.add": "Agregar",
    "common.saved": "guardados",
    "common.justNow": "Ahora mismo",
    "common.ago": "",
    
    // Time
    "time.m": "m",
    "time.h": "h",
    "time.d": "d",
    "time.w": "s",
    "time.mo": "mes",
    "time.y": "a",
    
    // Library
    "library.title": "RecLib",
    "library.empty.title": "Sin recomendaciones",
    "library.empty.subtitle": "Toca + para guardar la primera",
    "library.search.placeholder": "Buscar recomendaciones...",
    "library.search.empty": "No se encontraron resultados",
    
    // Categories
    "categories.title": "Categorías",
    "categories.empty.title": "Nada guardado aún",
    "categories.empty.subtitle": "Comienza a agregar recomendaciones para verlas organizadas aquí",
    
    // Add Recommendation
    "add.title": "Agregar Recomendación",
    "add.shared.title": "Guardar Enlace Compartido",
    "add.edit.title": "Editar Recomendación",
    "add.choose.title": "¿Cómo quieres agregar?",
    "add.scan.title": "Escanear Imagen",
    "add.scan.subtitle": "Toma una foto o selecciona de la galería",
    "add.manual.title": "Ingresar Manualmente",
    "add.manual.subtitle": "Escribe los detalles tú mismo",
    "add.camera.title": "Tomar Foto",
    "add.camera.subtitle": "Captura una captura de pantalla o portada",
    "add.processing": "Analizando imagen...",
    "add.found": "¡Encontrado!",
    "add.useThis": "Usar Esto",
    "add.field.title": "Título",
    "add.field.title.placeholder": "ej., El Gran Gatsby",
    "add.field.category": "Categoría",
    "add.field.platform": "Plataforma",
    "add.field.notes": "Notas (opcional)",
    "add.field.notes.placeholder": "¿Por qué fue recomendado? ¿Algún comentario?",
    "add.field.url": "URL de Plataforma (opcional)",
    "add.field.url.hint": "Deja vacío para generar un enlace automático",

    // AI Scan Limits
    "ai.scansRemaining": "escaneos restantes",
    "ai.freeVersion": "Versión de prueba",
    "ai.limitReached.title": "Límite de escaneos alcanzado",
    "ai.limitReached.message": "Has usado los 3 escaneos con IA disponibles en esta versión. Aún puedes agregar recomendaciones manualmente.",
    "ai.scanInfo": "En esta versión de prueba, tienes {remaining} de {total} escaneos con IA disponibles.",

    // Detail
    "detail.title": "Detalles",
    "detail.openOn": "Abrir en",
    "detail.notes": "Notas",
    "detail.added": "Agregado",
    "detail.modified": "Modificado",
    "detail.delete.title": "Eliminar Recomendación",
    "detail.delete.message": "¿Estás seguro de que quieres eliminar esto?",
    
    // Share
    "share.checkOut": "Mira",
    "share.openIn": "Abrir en RecLib",
    "share.copied": "¡Enlace copiado al portapapeles!",
    "share.uploading": "Creando enlace...",
    "share.failed": "Error al crear el enlace",
    
    // Import
    "import.title": "Recomendación Compartida",
    "import.sharedWithYou": "Compartido contigo",
    "import.addToLibrary": "Agregar a Mi Biblioteca",
    "import.importing": "Agregando...",
    "import.success": "¡Agregado!",
    "import.successMessage": "La recomendación fue agregada a tu biblioteca.",
    "import.notFound": "Esta recomendación no fue encontrada o ha expirado.",
    "import.error": "Error al cargar la recomendación compartida.",
    "import.importError": "Error al agregar a tu biblioteca.",
    
    // Common
    "common.loading": "Cargando...",
    "common.goBack": "Volver",
    "common.error": "Error",
    
    // Settings
    "settings.title": "Ajustes",
    "settings.profile": "Perfil",
    "settings.displayName": "Nombre",
    "settings.preferences": "Preferencias",
    "settings.defaultCategory": "Categoría Predeterminada",
    "settings.sortOrder": "Ordenar Por",
    "settings.sort.recent": "Más Reciente",
    "settings.sort.alphabetical": "A-Z",
    "settings.sort.category": "Por Categoría",
    "settings.language": "Idioma",
    "settings.about": "Acerca de",
    "settings.version": "Versión",
    "settings.total": "Total de Recomendaciones",
    "settings.privacy": "Política de Privacidad",
    "settings.terms": "Términos de Servicio",
    "settings.footer": "RecLib",
    "settings.footerSub": "Tu cuaderno personal de recomendaciones",
  },
};
