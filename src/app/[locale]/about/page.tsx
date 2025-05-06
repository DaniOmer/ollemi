"use client";

import React from "react";
import Image from "next/image";
import { useTranslations } from "@/hooks/useTranslations";
import { motion } from "framer-motion";

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function AboutUsPage() {
  const { t } = useTranslations();

  // Values with icons that match their meaning
  const values = [
    {
      name: "Proximité",
      description:
        "Nous croyons que chaque professionnel mérite un accompagnement humain et réactif.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
    },
    {
      name: "Excellence",
      description:
        "Nous concevons des fonctionnalités robustes, pensons chaque détail et testons chaque flux pour garantir la fluidité.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
          />
        </svg>
      ),
    },
    {
      name: "Innovation",
      description:
        "Nous mettons la technologie au service de la beauté, pour anticiper les besoins et créer des services toujours plus personnalisés.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 10V3L4 14h7v7l9-11h-7z"
          />
        </svg>
      ),
    },
    {
      name: "Respect des cultures",
      description:
        "Qu'il s'agisse des habitudes de paiement mobile en Afrique ou des attentes de design en Europe, notre solution s'adapte à chaque territoire.",
      icon: (
        <svg
          className="w-6 h-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      ),
    },
  ];

  return (
    <main>
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-primary/5 to-accent/5 py-20 md:py-32">
        <div className="absolute inset-0 z-0 opacity-20">
          <div className="absolute -left-10 top-10 h-72 w-72 rounded-full bg-primary/30 mix-blend-multiply blur-3xl"></div>
          <div className="absolute right-0 bottom-10 h-72 w-72 rounded-full bg-accent/30 mix-blend-multiply blur-3xl"></div>
        </div>
        <div className="container-responsive relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-center"
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 gradient-text">
              À propos de nous
            </h1>
            <p className="text-lg md:text-xl max-w-3xl mx-auto text-muted-foreground">
              Découvrez l'histoire de notre collaboration franco-ivoirienne et
              notre vision commune pour redéfinir l'expérience beauté et
              bien-être.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-10 bg-background">
        <div className="container-responsive">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="flex flex-col md:flex-row justify-center gap-12 items-center"
          >
            {/* Founder 1 */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-center items-center text-center"
            >
              <div className="relative w-64 h-64 mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-primary/20 to-accent/20 shadow-xl">
                {/* Replace with actual image when available */}
                <div className="absolute inset-0 flex items-center justify-center text-primary/50">
                  <svg
                    className="w-20 h-20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                {/* Uncomment this when you have an actual image */}
                {/* <Image 
                  src="/path-to-founder1-image.jpg" 
                  alt="Fondateur 1" 
                  fill 
                  className="object-cover"
                /> */}
              </div>
              <h3 className="text-2xl font-bold mb-2">Berloge HOUNKANRIN</h3>
              <p className="text-muted-foreground mb-4">
                Expertise en innovations beauté & lifestyle
              </p>
            </motion.div>

            {/* Founder 2 */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col justify-center items-center text-center"
            >
              <div className="relative w-64 h-64 mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-accent/20 to-primary/20 shadow-xl">
                {/* Replace with actual image when available */}
                <div className="absolute inset-0 flex items-center justify-center text-primary/50">
                  <svg
                    className="w-20 h-20"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    />
                  </svg>
                </div>
                {/* Uncomment this when you have an actual image */}
                {/* <Image 
                  src="/path-to-founder2-image.jpg" 
                  alt="Fondateur 2" 
                  fill 
                  className="object-cover"
                /> */}
              </div>
              <h3 className="text-2xl font-bold mb-2">Omer DOTCHAMOU</h3>
              <p className="text-muted-foreground mb-4">
                Expertise en innovation digitale et marketing
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary/20">
        <div className="container-responsive">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="max-w-4xl mx-auto space-y-16"
          >
            {/* Notre rencontre */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-bold gradient-text">
                Notre rencontre et notre passion commune
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Tout a commencé il y a plus de dix ans, dans un petit café
                cotonois, où nous étions tous deux étudiants et entrepreneurs.
                L'un voyageait beaucoup dans la sous-région pour découvrir les
                dernières tendances africaines, l'autre rêvait de réinventer
                l'expérience client dans les salons de beauté et les studios de
                bien-être. Rapidement, nous avons réalisé que notre passion
                commune pour la mode, le lifestyle et l'innovation digitale
                pouvait devenir bien plus qu'un simple échange d'idées : une
                aventure entrepreneuriale.
              </p>
            </motion.div>

            {/* Vision */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-bold gradient-text">
                Une vision née de deux continents
              </h2>
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Fusionner style et technologie
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    De mon côté, en France, j'observais comment les grandes
                    métropoles adoptaient des plateformes toujours plus
                    intuitives pour réserver un massage, une coupe de cheveux ou
                    une manucure. Mon associé, en Côte d'Ivoire, constatait que,
                    malgré un marché en pleine croissance, peu d'outils
                    numériques correspondaient aux spécificités locales –
                    fuseaux horaires, moyens de paiement, approvisionnement en
                    produits. Ensemble, nous avons imaginé une solution qui
                    combine l'exigence esthétique et l'agilité africaine, pour
                    offrir aux professionnels de la beauté et du bien-être un
                    outil sur-mesure, simple et accessible.
                  </p>
                </div>
                <div>
                  <h3 className="text-2xl font-semibold mb-3">
                    Répondre aux besoins réels
                  </h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    Notre application est née de rencontres : coiffeurs dans les
                    quartiers animés d'Abidjan, esthéticiennes en banlieue
                    parisienne, barbiers dans les ruelles de Marseille, spa
                    managers à Dakar… Chacun nous a confié ses frustrations :
                    perte de rendez-vous, pénurie de visibilité en ligne,
                    difficultés de gestion de planning et de trésorerie. Ces
                    échanges nous ont guidés pour bâtir une plateforme à
                    l'écoute des métiers, qui facilite la prise de rendez-vous,
                    optimise la gestion du temps et développe la clientèle, dans
                    un écosystème uni par la créativité et l'excellence du
                    service.
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Values */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-bold gradient-text">
                Nos valeurs fondatrices
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {values.map((value, index) => (
                  <div
                    key={index}
                    className="bg-white p-6 rounded-xl shadow-soft hover-lift transition-all"
                  >
                    <div className="flex items-center mb-4">
                      <div className="p-3 rounded-lg bg-primary/10 text-primary mr-4">
                        {value.icon}
                      </div>
                      <h3 className="text-xl font-bold">{value.name}</h3>
                    </div>
                    <p className="text-muted-foreground">{value.description}</p>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Mission */}
            <motion.div variants={itemVariants} className="space-y-6">
              <h2 className="text-3xl font-bold gradient-text">
                Notre mission pour l'Afrique
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Nous sommes convaincus que le potentiel du secteur beauté &
                bien-être en Afrique n'a pas fini de s'exprimer. En réunissant
                nos expertises franco-ivoiriennes, nous voulons :
              </p>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="mr-4 mt-1 p-1 rounded-full bg-primary/10 text-primary">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg">
                    <strong>Digitaliser</strong> les salons et studios pour
                    qu'ils gagnent en autonomie et en attractivité.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 p-1 rounded-full bg-primary/10 text-primary">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg">
                    <strong>Former</strong> les professionnels aux bonnes
                    pratiques du marketing en ligne, de la gestion client et de
                    l'analyse de données.
                  </p>
                </li>
                <li className="flex items-start">
                  <div className="mr-4 mt-1 p-1 rounded-full bg-primary/10 text-primary">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  </div>
                  <p className="text-lg">
                    <strong>Créer</strong> un réseau solidaire, où les talents
                    africains et européens se rencontrent, échangent et
                    grandissent ensemble.
                  </p>
                </li>
              </ul>
            </motion.div>

            {/* Conclusion */}
            <motion.div
              variants={itemVariants}
              className="bg-gradient-to-r from-primary/10 to-accent/10 p-8 rounded-2xl text-center"
            >
              <p className="text-xl italic">
                "Rejoignez-nous dans cette aventure : redéfinissons ensemble
                l'expérience beauté & lifestyle pour toute une génération, du
                Cap-Vert à la Côte d'Azur. Votre succès est notre plus belle
                histoire."
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </main>
  );
}
