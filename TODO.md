# Debug & Repair TODO List

## Phase 1: Landing Page (`dentalcare-saas.html`)
- [x] 1. Add Supabase auth script (using CDN)
- [x] 2. Create Login Modal (popup with email/password + Supabase auth)
- [x] 3. Create Register/Signup Modal (popup with email/password + Supabase auth)
- [x] 4. Add "Espace Client" button in navbar → opens login modal / redirects if logged in
- [x] 5. Fix all pricing plan buttons: replace `ouvrirModal()` → open register modal
- [x] 6. Fix "Démarrer gratuitement" button opens register modal
- [x] 7. Fix "Voir la démo" button → scroll down to dashboard preview
- [x] 8. Fix CTA section "Démarrer gratuitement" button → open register modal
- [x] 9. Add `ouvrirModal()` function definition
- [x] 10. Auto-redirect if user already authenticated
- [x] 11. Redirect to dashboard after successful login/register
- [x] 12. Fix any button that was not connected

## Phase 2: React Dashboard (`dentacloud-dashboard/`)
- [x] 13. Fix `main.tsx` — remove invalid `import './types.d.ts'`
- [x] 14. Fix TypeScript strict-mode issues in all components
- [x] 15. Fix `verbatimModuleSyntax` issues (import types properly)
- [x] 16. Fix `noUncheckedIndexedAccess` issues 
- [x] 17. Fix `exactOptionalPropertyTypes` issues
- [x] 18. Verify all imports/exports are correct
- [x] 19. Ensure clean build

## Phase 3: Verification
- [x] 20. Run build and verify no errors
- [x] 21. Confirm all buttons, modals, navigation, auth flows work

