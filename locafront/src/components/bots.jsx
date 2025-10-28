import React, { useState, useEffect, useRef } from "react";

export default function Bots() {
  // State
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: "bot", text: "👋 Bonjour ! Je suis Sarah, votre conseillère WeCar. Ravie de vous accompagner dans la recherche de votre voiture de location idéale ! 🚗\n\nDe quel type de véhicule avez-vous besoin pour votre prochain voyage ?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBoxRef = useRef(null);

  // Couleurs WeCar
  const wecarColors = {
    primary: "#36c275",
    secondary: "#2aa15f",
    light: "#e8f7ef",
    dark: "#1e7a4a",
    gradient: "linear-gradient(135deg, #36c275 0%, #2aa15f 100%)",
    messageText: "#444444"
  };

  // === BASE DE CONNAISSANCE AVEC APPROCHE COMMERCIALE ===
  const answers = [
    { 
      keywords: ["bonjour", "salut", "hey", "hello", "coucou"], 
      reply: "👋 Bonjour ! Je suis Sarah de WeCar, ravie de faire votre connaissance ! \n\nJe vois que vous cherchez une voiture de location ? Pourriez-vous me dire un peu plus sur votre projet de voyage ? Par exemple :\n• Combien de personnes voyagez-vous ?\n• Quelle est votre destination préférée ?\n• Avez-vous un budget en tête ?\n\nJe pourrai ainsi vous proposer les meilleures options ! 😊" 
    },
    { 
      keywords: ["merci", "thanks", "thank you", "super", "parfait"], 
      reply: "😊 Mais je vous en prie ! C'est un vrai plaisir de vous aider.\n\nEst-ce qu'il y a autre chose qui vous préoccupe concernant votre location ? Peut-être des questions sur l'assurance, les options supplémentaires, ou les modalités de retrait ?\n\nJe reste à votre disposition pour toutes vos interrogations !" 
    },
    { 
      keywords: ["aide", "support", "help", "urgence", "problème"], 
      reply: "🔧 Bien sûr, je suis là pour vous accompagner ! \n\nPour résoudre rapidement votre situation, pourriez-vous me décrire le défi que vous rencontrez ? \n\nEn attendant, voici nos contacts prioritaires :\n📞 Support client : +212 522 543 210\n🆘 Urgences 24h/24 : +212 661 789 456\n\nNous sommes là pour vous !" 
    },

    // Types de voitures - Approche conversationnelle
    { 
      keywords: ["voiture", "véhicule", "auto", "car", "louer"], 
      reply: "🚗 Excellente idée de louer avec WeCar ! Nous avons justement une super offre en ce moment.\n\nPour vous proposer le véhicule parfait, j'aimerais connaître :\n• Combien serez-vous à voyager ?\n• Préférez-vous un trajet ville ou aventure ?\n• Avez-vous des bagages particuliers ?\n\nCela me permettra de vous guider vers le modèle idéal !" 
    },
    { 
      keywords: ["4x4", "suv", "désert", "offroad", "aventure", "merzouga"], 
      reply: "🏜️ Ah, l'appel du désert ! Les 4x4 sont effectivement nos stars pour les aventures sahariennes ! \n\nLe Toyota Hilux est particulièrement apprécié pour sa fiabilité dans les dunes. En ce moment, nous avons une promotion à 690 DH/jour au lieu de 750 DH pour les réservations de 5 jours et plus.\n\nAvez-vous déjà une date en tête pour votre aventure ?" 
    },
    { 
      keywords: ["citadine", "économique", "petite", "city", "budget", "pas cher"], 
      reply: "💰 Excellente option ! Nos citadines sont parfaites pour les budgets serrés sans compromis le confort.\n\nLa Dacia Sandero à 250 DH/jour est notre best-seller - climatisation, consommation réduite, et assurance tous risques incluse.\n\nPetit conseil : En réservant 3 jours ou plus, vous bénéficiez de la livraison gratuite à votre hôtel ! Ça vous dit ?" 
    },
    { 
      keywords: ["berline", "confort", "familiale", "family", "groupe", "amis"], 
      reply: "👨‍👩‍👧‍👦 Parfait pour les voyages en famille ou entre amis ! Les berlines offrent cet espace et confort si précieux sur la route.\n\nLa Renault Scénic à 7 places est idéale - grand coffre de 550L, GPS intégré, et sièges enfants disponibles.\n\nJe vous recommande de réserver à l'avance car ces modèles partent très vite, surtout en période de vacances !" 
    },
    { 
      keywords: ["luxe", "premium", "bmw", "mercedes", "audi", "anniversaire", "mariage"], 
      reply: "💎 Pour une occasion spéciale, rien de mieux qu'une voiture premium ! \n\nNous avons justement reçu de nouvelles BMW Série 3 - intérieur cuir, système audio premium, et toutes les options confort.\n\nÀ 1200 DH/jour, c'est l'élégance absolue pour marquer le coup. C'est pour célébrer un événement particulier ?" 
    },

    // Réservation et tarifs - Approche commerciale
    { 
      keywords: ["réservation", "réserver", "disponibilité", "book", "commander"], 
      reply: "📅 Super ! Je suis ravie que vous ayez choisi WeCar pour votre voyage.\n\nPour vérifier les disponibilités exactes, pourriez-vous me préciser :\n• Les dates exactes de location ?\n• Le lieu de retrait (aéroport, agence, hôtel) ?\n• Le type de véhicule qui vous intéresse ?\n\nJe pourrai alors vous confirmer immédiatement les options disponibles !" 
    },
    { 
      keywords: ["prix", "tarif", "coût", "combien", "price", "budget"], 
      reply: "💵 Je comprends tout à fait - le budget est important dans un projet de voyage !\n\nVoici nos tarifs actuels avec les promotions :\n• 🚗 Citadine : 250-400 DH/jour (-10% si 7+ jours)\n• 🚙 Familiale : 450-600 DH/jour (-15% si 7+ jours)\n• 🏜️ 4x4 Aventure : 700-900 DH/jour (-20% si 7+ jours)\n• 💎 Premium : 1200+ DH/jour\n\nQuelle gamme correspond le mieux à vos besoins ?" 
    },
    { 
      keywords: ["inclut", "équipement", "services", "include", "compris"], 
      reply: "🛡️ Chez WeCar, nous croyons à la transparence totale ! Voici ce qui est INCLUD dans TOUTES nos locations :\n\n✓ Assurance tous risques (zéro souci)\n✓ Assistance routière 24h/24 (on est là !)\n✓ Kilométrage illimité (roulez librement)\n✓ Nettoyage complet (reçu comme neuf)\n✓ Contrôle technique rigoureux\n\nEt en option : GPS, siège bébé, conducteur... Des questions sur une option particulière ?" 
    },

    // Destinations - Approche inspirante
    { 
      keywords: ["maroc", "morocco", "marrakech", "casablanca", "agadir", "fès", "tanger", "destination"], 
      reply: "🗺️ Le Maroc regorge de merveilles ! Chaque destination a son charme...\n\n• Marrakech : parfaite avec une citadine pour la ville\n• Désert : l'incontournable 4x4 pour Merzouga\n• Côte atlantique : berline confort pour Agadir-Essaouira\n• Montagnes : SUV pour l'Atlas et ses paysages\n\nAvez-vous déjà repéré les endroits que vous souhaitez absolument découvrir ? Je peux vous suggérer des itinéraires !" 
    },
    { 
      keywords: ["désert", "merzouga", "zagora", "sahara", "dunes", "bivouac"], 
      reply: "🐫 Le Sahara... Quelle magie ! C'est notre destination coup de cœur ❤️\n\nPour cette aventure, je vous recommande vivement le Toyota Hilux - increvable dans les dunes, climatisation puissante, et kit sable inclus.\n\nPetit conseil local : prévoyez le coucher de soleil à Merzouga - c'est un moment absolument magique ! Vous partez pour combien de jours ?" 
    },

    // Questions pratiques
    { 
      keywords: ["permis", "document", "papiers", "license", "âge"], 
      reply: "📋 Pour conduire en toute sérénité, voici les documents nécessaires :\n\n✓ Permis de conduire valide (21 ans minimum)\n✓ Passeport ou carte d'identité\n✓ Carte de crédit pour la caution\n\nLa bonne nouvelle : pas de paperasse compliquée ! Tout se fait en 10 minutes à l'agence.\n\nVous avez votre permis depuis plus d'un an ?" 
    },
    { 
      keywords: ["enfant", "famille", "siège", "baby", "child", "bébé"], 
      reply: "👶 Voyager avec des enfants, c'est toute une organisation ! Nous sommes là pour vous simplifier la vie.\n\nSièges enfant disponibles :\n• Siège bébé (0-3 ans) : 40 DH/jour\n• Réhausseur (4-7 ans) : 30 DH/jour\n\nConseil : Réservez-les à l'avance pour être certain de les avoir. Combien avez-vous d'enfants et quel âge ont-ils ?" 
    },
    { 
      keywords: ["téléphone", "contact", "urgence", "phone", "appeler", "whatsapp"], 
      reply: "📞 Bien sûr ! Voici comment nous joindre facilement :\n\n• 📱 Service client : +212 522 543 210\n• 💬 WhatsApp : +212 661 789 456 (réponse instantanée)\n• 🆘 Urgences 24h/24 : +212 522 543 211\n• 📧 Email : bonjour@wecar.com\n\nNous sommes disponibles du lundi au dimanche de 7h à 22h. N'hésitez surtout pas !" 
    },

    // Promotions - Approche engageante
    { 
      keywords: ["promo", "réduction", "offre", "code", "discount", "économiser"], 
      reply: "🎁 Vous tombez bien ! Nous avons justement lancé notre offre spéciale \"AVENTURE 2024\" :\n\n🔥 -20% sur toutes les locations de 7 jours ou plus\n🎯 Livraison GRATUITE dans tous les aéroports\n💎 1 option gratuite au choix (GPS ou siège enfant)\n\nCette offre est valable jusqu'à la fin du mois. Ça vous intéresse pour vos dates ?" 
    },
    { 
      keywords: ["longue durée", "mois", "semaine", "long term", "étendu"], 
      reply: "📅 Excellente idée ! Plus la location est longue, plus l'économie est belle :\n\n• 2 semaines : -20% sur le tarif journalier\n• 3 semaines : -25% + option GPS offerte\n• 1 mois complet : -30% + livraison gratuite partout\n\nCes forfaits incluent bien sûr l'assurance tous risques et l'assistance 24h/24. Vous pensez à quelle durée ?" 
    },
    { 
      keywords: ["livraison", "aéroport", "hôtel", "delivery", "domicile"], 
      reply: "🚚 Oui, absolument ! Nous livrons GRATUITEMENT votre véhicule :\n\n✓ Dans tous les aéroports marocains\n✓ Dans les gares principales\n✓ Dans les hôtels partenaires\n\nPour les autres adresses, un petit supplément de 50-100 DH selon la distance.\n\nOù souhaiteriez-vous que nous vous apportions votre voiture ?" 
    }
  ];

  // === SIMILARITÉ (tolérance fautes) ===
  function similarity(a, b) {
    a = a.toLowerCase();
    b = b.toLowerCase();
    if (a === b) return 1;
    if (a.length < 2 || b.length < 2) return 0;
    let same = 0;
    for (let i = 0; i < Math.min(a.length, b.length); i++) {
      if (a[i] === b[i]) same++;
    }
    return same / Math.max(a.length, b.length);
  }

  // === GÉNÉRATION DE RÉPONSE INTELLIGENTE ===
  function generateSmartReply(userText) {
    const text = userText.trim().toLowerCase();
    if (!text) return "👋 Je suis là pour vous aider ! Pourriez-vous me dire ce que vous recherchez exactement ?";

    // Détection du contexte et réponse personnalisée
    if ((text.includes("4x4") || text.includes("désert")) && !text.includes("prix")) {
      return "🏜️ Ah, une âme d'aventurier ! Les 4x4 sont parfaits pour explorer le Sahara en toute liberté.\n\nLe Toyota Hilux à 690 DH/jour (promo actuelle) est notre valeur sûre - fiable, confortable, et équipé pour le sable.\n\nAvez-vous déjà une idée des dates pour votre escapade saharienne ?";
    }

    if (text.includes("économique") || (text.includes("pas cher") && text.includes("voiture"))) {
      return "💰 Je comprends tout à fait ! Le budget est important.\n\nNotre Dacia Sandero à 250 DH/jour offre le meilleur rapport qualité-prix : clim, assurance complète, et consommation réduite.\n\nPetit plus : En réservant 3 jours, la livraison à votre hôtel est offerte ! Ça vous tente ?";
    }

    if ((text.includes("famille") || text.includes("enfant")) && !text.includes("siège")) {
      return "👨‍👩‍👧‍👦 Voyager en famille, c'est créer des souvenirs inoubliables ! \n\nLa Renault Scénic 7 places à 450 DH/jour est idéale : spacieuse, confortable, et nous pouvons ajouter des sièges enfants.\n\nCombien serez-vous exactement ? Cela me permettra de vous conseiller au mieux !";
    }

    // Recherche dans la base de connaissances
    const words = text.split(/\s+/);
    let bestMatch = null;
    let highestScore = 0;

    for (let ans of answers) {
      for (let kw of ans.keywords) {
        for (let word of words) {
          const score = similarity(word, kw);
          if (score > highestScore && score >= 0.6) {
            highestScore = score;
            bestMatch = ans.reply;
          }
        }
      }
    }

    if (bestMatch) {
      return bestMatch;
    }

    // Réponse par défaut engageante
    return "🤔 Je veux m'assurer de bien comprendre votre demande. Pourriez-vous reformuler ou me dire :\n\n• Quel type de voyage préparez-vous ?\n• Combien de personnes voyagent ?\n• Avez-vous une destination en tête ?\n\nJe pourrai alors vous proposer des solutions vraiment adaptées ! 😊";
  }

  // === EFFET D'ÉCRITURE NATUREL ===
  const typeMessage = async (message) => {
    setIsTyping(true);
    
    const botMessageIndex = messages.length;
    setMessages(prev => [...prev, { from: "bot", text: "" }]);

    let i = 0;
    await new Promise(resolve => {
      const typingInterval = setInterval(() => {
        setMessages(prev => {
          const newMessages = [...prev];
          if (newMessages[botMessageIndex]) {
            newMessages[botMessageIndex].text = message.substring(0, i + 1);
          }
          return newMessages;
        });

        i++;
        if (i >= message.length) {
          clearInterval(typingInterval);
          setIsTyping(false);
          resolve();
        }
      }, 20);
    });
  };

  // === ENVOI MESSAGE ===
  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userMessage = { from: "user", text: input };
    setMessages(prev => [...prev, userMessage]);
    const userInput = input;
    setInput("");

    await new Promise(resolve => setTimeout(resolve, 800));
    
    const reply = generateSmartReply(userInput);
    await typeMessage(reply);
  };

  // === AUTO SCROLL ===
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [messages]);

  // === GESTION CLIC EXTÉRIEUR ===
  useEffect(() => {
    const handleClickOutside = (event) => {
      const chatContainer = document.getElementById("chat-container");
      const toggleBtn = document.getElementById("chat-toggle");
      
      if (isOpen && chatContainer && !chatContainer.contains(event.target) && event.target !== toggleBtn) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <>
      {/* Bouton de chat */}
      <button
        id="chat-toggle"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          borderRadius: "50%",
          background: wecarColors.gradient,
          color: "#fff",
          fontSize: "18px",
          width: "50px",
          height: "50px",
          border: "none",
          cursor: "pointer",
          zIndex: 1000,
          boxShadow: "0 4px 15px rgba(54, 194, 117, 0.4)",
          transition: "all 0.3s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
        }}
      >
        💬
      </button>

      {/* Chatbox */}
      {isOpen && (
        <section
          id="chat-container"
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "340px",
            height: "450px",
            display: "flex",
            flexDirection: "column",
            background: "#fff",
            borderRadius: "16px",
            boxShadow: "0 10px 40px rgba(0,0,0,0.15)",
            overflow: "hidden",
            zIndex: 999,
            border: `1px solid ${wecarColors.light}`,
          }}
        >
          {/* En-tête */}
          <div
            style={{
              background: wecarColors.gradient,
              color: "#fff",
              padding: "16px",
              fontSize: "15px",
              fontWeight: "600",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ fontSize: "20px" }}>🚗</span>
              <div>
                <div>Sarah - WeCar</div>
                <div style={{ fontSize: "11px", opacity: 0.9 }}>Conseillère locations</div>
              </div>
            </div>
            <span style={{ 
              fontSize: "10px", 
              background: "rgba(255,255,255,0.25)", 
              padding: "4px 8px", 
              borderRadius: "10px",
            }}>
              En ligne
            </span>
          </div>

          {/* Zone de conversation - ORGANISATION INVERSEE */}
          <div
            ref={chatBoxRef}
            style={{
              flex: 1,
              padding: "16px",
              overflowY: "auto",
              fontSize: "14px",
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              background: "#f8f9fa",
            }}
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  // CLIENT À DROITE, ROBOT À GAUCHE
                  alignItems: msg.from === "user" ? "flex-end" : "flex-start",
                }}
              >
                {/* Indicateur d'expéditeur */}
                <div
                  style={{
                    fontSize: "11px",
                    color: "#999",
                    marginBottom: "4px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    // Alignement cohérent avec les messages
                    alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                    padding: msg.from === "user" ? "0 8px 0 0" : "0 0 0 8px",
                  }}
                >
                  <span style={{ 
                    color: msg.from === "user" ? wecarColors.primary : "#999",
                    fontSize: "8px"
                  }}>●</span>
                  <span>{msg.from === "user" ? "Vous" : "Sarah"}</span>
                  <span style={{ fontSize: "10px" }}>
                    {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Bulle de message */}
                <div
                  style={{
                    color: wecarColors.messageText,
                    whiteSpace: "pre-line",
                    lineHeight: "1.5",
                    fontSize: "14px",
                    fontWeight: "400",
                    textAlign: "left",
                    maxWidth: "85%",
                    // STYLES DIFFÉRENTS POUR CLIENT ET ROBOT
                    background: msg.from === "user" ? wecarColors.light : "#fff",
                    padding: "12px 16px",
                    borderRadius: msg.from === "user" ? "18px 4px 18px 18px" : "4px 18px 18px 18px",
                    border: msg.from === "user" ? "none" : `1px solid ${wecarColors.light}`,
                    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
                    // Positionnement clair
                    alignSelf: msg.from === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  {msg.text}
                  {isTyping && i === messages.length - 1 && (
                    <span style={{ 
                      marginLeft: "2px",
                      animation: "blink 1s infinite",
                      color: wecarColors.primary
                    }}>|</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Zone de saisie */}
          <div
            style={{
              display: "flex",
              borderTop: `1px solid ${wecarColors.light}`,
              padding: "12px",
              background: "#fff",
              gap: "8px",
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Tapez votre message ici..."
              disabled={isTyping}
              style={{
                flex: 1,
                border: `1px solid ${wecarColors.light}`,
                outline: "none",
                padding: "10px 16px",
                borderRadius: "24px",
                fontSize: "14px",
                background: "#f8f9fa",
                transition: "all 0.3s ease",
              }}
              onFocus={(e) => {
                e.target.style.background = "#fff";
                e.target.style.borderColor = wecarColors.primary;
              }}
              onBlur={(e) => {
                e.target.style.background = "#f8f9fa";
                e.target.style.borderColor = wecarColors.light;
              }}
            />
            <button
              onClick={sendMessage}
              disabled={isTyping || !input.trim()}
              style={{
                border: "none",
                background: wecarColors.gradient,
                color: "#fff",
                padding: "10px",
                cursor: isTyping || !input.trim() ? "not-allowed" : "pointer",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                opacity: isTyping || !input.trim() ? 0.6 : 1,
                fontSize: "14px",
                transition: "all 0.3s ease",
              }}
            >
              {isTyping ? "⏳" : "➤"}
            </button>
          </div>
        </section>
      )}

      {/* Animation de frappe */}
      <style>
        {`
          @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
          }
          
          @media (max-width: 480px) {
            #chat-container {
              width: 90% !important;
              right: 5% !important;
              height: 55vh !important;
            }
          }
        `}
      </style>
    </>
  );
}
