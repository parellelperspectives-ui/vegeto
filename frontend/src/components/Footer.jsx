import { AlertTriangle } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-gray-200 bg-gray-50">
      <div className="max-w-3xl mx-auto px-4 py-4 flex items-start gap-2">
        <AlertTriangle className="text-amber-400 shrink-0 mt-0.5" size={14} />
        <p className="text-xs text-gray-600 leading-relaxed">
          <strong className="text-gray-500">Avertissement médical</strong> — 
          Les informations de Vegeto sont fournies à titre indicatif uniquement 
          et ne remplacent pas l'avis d'un professionnel de santé. Consultez un 
          médecin ou un pharmacien avant toute utilisation thérapeutique.
        </p>
      </div>
    </footer>
  );
}