export function PayMarks() {
  return (
    <div className="pm-row" aria-label="Visa, Mastercard, American Express, Link, and Apple Pay">
      <svg className="pm" viewBox="0 0 48 32" role="img" aria-label="Visa">
        <rect width="48" height="32" rx="4" fill="#fff" />
        <text x="24" y="21" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontStyle="italic" fontWeight="700" fontSize="15" fill="#1A1F71">
          VISA
        </text>
      </svg>
      <svg className="pm" viewBox="0 0 48 32" role="img" aria-label="Mastercard">
        <rect width="48" height="32" rx="4" fill="#fff" />
        <circle cx="20" cy="16" r="8" fill="#EB001B" />
        <circle cx="28" cy="16" r="8" fill="#F79E1B" />
        <path d="M24 9.4a8 8 0 0 1 0 13.2 8 8 0 0 1 0-13.2z" fill="#FF5F00" />
      </svg>
      <svg className="pm" viewBox="0 0 48 32" role="img" aria-label="American Express">
        <rect width="48" height="32" rx="4" fill="#2E77BC" />
        <text x="24" y="13.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="6.2" fill="#fff" letterSpacing="0.4">
          AMERICAN
        </text>
        <text x="24" y="22" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="6.2" fill="#fff" letterSpacing="0.4">
          EXPRESS
        </text>
      </svg>
      <svg className="pm" viewBox="0 0 48 32" role="img" aria-label="Link">
        <rect width="48" height="32" rx="4" fill="#00D66F" />
        <text x="24" y="20.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="13" fill="#011E0F">
          link
        </text>
      </svg>
      <svg className="pm" viewBox="0 0 48 32" role="img" aria-label="Apple Pay">
        <rect width="48" height="32" rx="4" fill="#000" />
        <path fill="#fff" d="M16.2 11.2c.5-.6.8-1.4.7-2.2-.7 0-1.5.5-2 1.1-.4.5-.8 1.4-.7 2.2.8 0 1.5-.4 2-1.1zm.7 1.1c-1.1-.1-2 .6-2.5.6s-1.3-.6-2.2-.6c-1.1 0-2.2.7-2.8 1.7-1.2 2.1-.3 5.2.8 6.9.6.8 1.2 1.7 2.1 1.7.8 0 1.2-.6 2.2-.6s1.3.6 2.2.5c.9 0 1.5-.8 2.1-1.6.6-.9.9-1.8.9-1.8s-1.7-.7-1.7-2.6c0-1.6 1.3-2.4 1.4-2.4-.8-1.1-2-1.3-2.5-1.4z" />
        <text x="30.5" y="19.5" textAnchor="middle" fontFamily="Arial, Helvetica, sans-serif" fontWeight="600" fontSize="9" fill="#fff">
          Pay
        </text>
      </svg>
    </div>
  );
}
