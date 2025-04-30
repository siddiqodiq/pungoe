// lib/prism.ts
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

// Import bahasa yang diperlukan
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-python';
import 'prismjs/components/prism-bash';
import 'prismjs/components/prism-markup';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-json';

// Inisialisasi Prism
if (typeof window !== 'undefined') {
  Prism.highlightAll();
}

export default Prism;