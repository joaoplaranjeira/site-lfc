---
applyTo: "**/*.html"
---

# Páginas HTML

- Mantém cada página autónoma e conserva a ordem das dependências:
  configuração, bibliotecas, dados da página e lógica da página.
- Reutiliza a estrutura visual já presente nas páginas vizinhas. Cabeçalhos e
  rodapés estão duplicados; replica neles alterações de navegação relevantes.
- Usa HTML semântico, `lang="pt"`, labels associados aos campos e texto
  alternativo descritivo nas imagens.
- Preserva navegação por teclado, foco visível e atributos ARIA existentes.
- Não removas Google Analytics, Font Awesome, Poppins, favicon ou folhas de
  estilo sem confirmar que a página deixou de depender deles.
- Usa caminhos relativos e confirma que ficheiros referenciados existem com a
  mesma capitalização.
- Evita adicionar lógica extensa inline. Coloca-a no JavaScript específico da
  página quando possível.
- Testa pelo menos uma largura móvel e uma largura desktop após alterações de
  layout.
