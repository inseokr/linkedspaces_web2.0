import Link from "next/link";

export function Footer() {
  return (
    <footer>
      <div>
        <nav aria-label="Footer links">
          <Link href="/privacy">Privacy Policy</Link>
          <span> · </span>
          <Link href="/terms">Terms of Service</Link>
        </nav>
      </div>

      <div aria-label="Social links">
        <a href="https://www.instagram.com/" target="_blank" rel="noreferrer">
          Instagram
        </a>
        <span> · </span>
        <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">
          LinkedIn
        </a>
      </div>

      <small>© {new Date().getFullYear()} LinkedSpaces</small>
    </footer>
  );
}
