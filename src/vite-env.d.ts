/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL of the CUTAS API, e.g. "https://api.cutas.cut.ac.za/api/v1". Defaults to "/api/v1" (same origin). */
  readonly VITE_API_BASE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
