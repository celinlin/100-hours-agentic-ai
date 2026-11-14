import type { T } from './types';

/**
 * Every module of formation-ia-gratuite.com (as listed on its home page) and the room(s)
 * of the hotel where its notions are taught. '00' is the lobby lounge (annex room).
 */
export interface NotionModule {
  title: T;
  rooms: string[];
}

export const NOTION_INDEX: { group: T; modules: NotionModule[] }[] = [
  {
    group: { fr: 'Fondamentaux et outils', en: 'Fundamentals and tools' },
    modules: [
      { title: { fr: 'Comprendre comment l’IA répond', en: 'Understanding how AI answers' }, rooms: ['01'] },
      { title: { fr: 'Comprendre comment l’IA apprend et crée', en: 'Understanding how AI learns and creates' }, rooms: ['01'] },
      { title: { fr: 'Bien formuler sa demande à l’IA', en: 'Phrasing your request well' }, rooms: ['02'] },
      { title: { fr: 'Résumer une réunion avec l’IA', en: 'Summarising a meeting with AI' }, rooms: ['02'] },
      { title: { fr: 'Chercher, lire et présenter avec l’IA', en: 'Searching, reading and presenting with AI' }, rooms: ['00', '06'] },
      { title: { fr: 'Vérifier les informations et leurs sources', en: 'Checking information and its sources' }, rooms: ['06'] },
      { title: { fr: 'Protéger les données partagées avec l’IA', en: 'Protecting data shared with AI' }, rooms: ['07', '08'] },
      { title: { fr: 'Faire travailler l’IA avec vos documents et outils', en: 'Making AI work with your documents and tools' }, rooms: ['03'] },
      { title: { fr: 'Tester l’IA sur une tâche en équipe', en: 'Testing AI on a team task' }, rooms: ['10'] },
      { title: { fr: 'Automatiser les tâches répétitives', en: 'Automating repetitive tasks' }, rooms: ['04', '13'] },
      { title: { fr: 'Analyser un tableau avec l’IA', en: 'Analysing a table with AI' }, rooms: ['11'] },
      { title: { fr: 'Protéger un assistant des documents piégés', en: 'Protecting an assistant from trapped documents' }, rooms: ['12'] },
      { title: { fr: 'Garder son jugement face à l’IA', en: 'Keeping your judgement' }, rooms: ['08'] },
      { title: { fr: 'Choisir sa demande et sa méthode', en: 'Choosing your request and method' }, rooms: ['02'] },
      { title: { fr: 'Préparer le contexte d’un travail complexe', en: 'Preparing the context of a complex job' }, rooms: ['02', '07'] },
      { title: { fr: 'Évaluer un assistant sur plusieurs cas', en: 'Evaluating an assistant on several cases' }, rooms: ['10'] },
      { title: { fr: 'Créer un petit outil avec l’IA', en: 'Building a small tool with AI' }, rooms: ['03'] },
      { title: { fr: 'Diagnostiquer un RAG qui échoue', en: 'Diagnosing a failing RAG' }, rooms: ['06'] },
      { title: { fr: 'Connecter des outils sans confondre les droits', en: 'Connecting tools without confusing rights' }, rooms: ['04', '05'] },
      { title: { fr: 'Comprendre ce qui reste sur votre ordinateur', en: 'Understanding what stays on your computer' }, rooms: ['05', '07'] },
      { title: { fr: 'Choisir une méthode à qualité définie', en: 'Choosing a method with defined quality' }, rooms: ['09', '11'] },
      { title: { fr: 'Découvrir l’IA au-delà du chat', en: 'AI beyond chat' }, rooms: ['09'] },
      { title: { fr: 'Réaliser un projet métier qui résiste aux exceptions', en: 'A business project that withstands exceptions' }, rooms: ['14'] },
      { title: { fr: 'Choisir le chiffre qui répond à la question', en: 'Choosing the figure that answers the question' }, rooms: ['10'] },
      { title: { fr: 'Apprendre à utiliser ChatGPT', en: 'Learning to use ChatGPT' }, rooms: ['00'] },
      { title: { fr: 'Apprendre à utiliser Claude', en: 'Learning to use Claude' }, rooms: ['00'] },
      { title: { fr: 'Utiliser Copilot dans Microsoft 365', en: 'Using Copilot in Microsoft 365' }, rooms: ['00'] },
    ],
  },
  {
    group: { fr: 'Piloter l’IA dans son entreprise', en: 'Steering AI in your organisation' },
    modules: [
      { title: { fr: 'Fixer les règles d’utilisation de l’IA', en: 'Setting AI usage rules' }, rooms: ['12'] },
      { title: { fr: 'Planifier les premiers projets IA', en: 'Planning the first AI projects' }, rooms: ['13'] },
      { title: { fr: 'Choisir un outil d’IA adapté à son besoin', en: 'Choosing an AI tool for the need' }, rooms: ['13'] },
      { title: { fr: 'Créer des contenus marketing avec l’IA', en: 'Creating marketing content with AI' }, rooms: ['00'] },
      { title: { fr: 'Répondre aux clients avec l’aide de l’IA', en: 'Answering customers with AI' }, rooms: ['08', '00'] },
      { title: { fr: 'Mesurer le temps gagné et la qualité avec l’IA', en: 'Measuring time saved and quality' }, rooms: ['11', '14'] },
      { title: { fr: 'Préparer une certification en IA', en: 'Preparing an AI certification' }, rooms: ['14'] },
    ],
  },
];
