# Smart Project Team Formation System - Frontend Portal

A premium, production-grade Student Registration web interface designed with modern SaaS aesthetics inspired by **Stripe Dashboard, Linear, Vercel, and Framer**.

---

## 📁 Project Structure

```
frontend/
├── registration.html    # Semantic HTML5 architecture & accessible form layout
├── styles.css           # Premium design system (tokens, glassmorphism, animations)
├── style.css            # Forwarding stylesheet for seamless backward compatibility
├── script.js            # Interactive client logic, validation, chip matrix & toast system
└── readme.md            # Frontend overview and guide
```

---

## 🎨 Design System & Visual Highlights

- **Palette**: Deep Navy (`#0F172A`, `#0B1120`), Royal Blue (`#3B82F6`), Cyan (`#06B6D4`), Emerald (`#10B981`), Rose (`#F43F5E`), and Crisp Slate Surfaces (`#F8FAFC`).
- **Typography**: `Plus Jakarta Sans` for clean, professional SaaS typography and `JetBrains Mono` for IDs, metrics, and badges.
- **Glassmorphism**: Multi-layered backdrop blurs (`backdrop-filter: blur(28px) saturate(180%)`), subtle border shines (`rgba(255, 255, 255, 0.08)`), and soft radial ambient lighting orbs.
- **Micro-Interactions**:
  - Live **Synergy Radar Simulation** in the left branding panel showcasing intelligent team balancing.
  - Interactive **Profile Completion Progress Bar** tracking filled criteria in real time.
  - Interactive **Multi-Select Skills Component** with chip removal, keyboard addition (`Enter`), duplicate prevention, and popular quick-add pills (`Java`, `Python`, `React`, `Spring Boot`, etc.).
  - Segmented **Experience Level Radio Cards** (Beginner, Intermediate, Advanced) with custom iconography and subtle selection glows.
  - Domain of Interest interactive toggle chips.
  - Asynchronous simulated registration submission with animated loading spinner.
  - Presentation-ready **Success Modal** with animated SVG checkmark drawing, unique registration code generation (`STU-2026-XXXXX`), summary receipt, and one-click clipboard copy.

---

## 🚀 How to Run & Preview

1. Open `frontend/registration.html` directly in any modern browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve with any local HTTP server:
   ```bash
   # Using Python
   python -m http.server 3000
   
   # Or using VS Code Live Server extension
   ```
3. Navigate to `http://localhost:3000/frontend/registration.html`.
