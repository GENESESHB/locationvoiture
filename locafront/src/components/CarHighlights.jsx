// CarHighlights.jsx
export default function CarHighlights() {
  const items = [
    {
      icon: "https://cdn-icons-png.flaticon.com/512/201/201623.png",
      title: "Meilleures offres de voitures",
      text: "Au Maroc",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/3202/3202926.png",
      title: "Des milliers de modèles",
      text: "De citadine à luxe",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/2331/2331970.png",
      title: "Paiement flexible",
      text: "Carte bancaire ou cash",
    },
    {
      icon: "https://cdn-icons-png.flaticon.com/512/126/126509.png",
      title: "Assistance 24h/24",
      text: "Disponible 7j/7",
    },
  ];

  return (
    <section className="hi-wrap flat" aria-label="Avantages de la location">
      <ul className="hi-row">
        {items.map((it, i) => (
          <li key={i} className="hi-item">
            <img className="hi-icon" src={it.icon} alt="" width={56} height={56} loading="lazy" />
            <div className="hi-content">
              <div className="hi-title">{it.title}</div>
              <div className="hi-text">{it.text}</div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

