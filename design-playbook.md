# Design Playbook Mobile 

> Documento de referencia consolidado para decisiones de diseño en interfaces mobile/responsive.
> Basado en Apple Human Interface Guidelines (HIG) y Google Material Design 3 (M3 + M3 Expressive).
> Uso: subir a Knowledge de Proyecto Claude. Consultar antes de cada decisión de UI relevante.

---

## Cómo usar este documento

1. Frente a una decisión de diseño concreta, citar el principio/regla aplicable.
2. Si el caso no está cubierto, responder con criterio propio marcándolo como tal.
3. Ante conflicto Apple vs Google en web, seguir la "Recomendación para Web Responsive" indicada.
4. Correr el Checklist (sección 4) antes de deployar cualquier pantalla mobile.

---

## 1. Principios convergentes

Principios donde Apple HIG y Material 3 coinciden, aunque usen distinto vocabulario.

### 1.1 Jerarquía visual clara
- **Apple:** establecer una jerarquía visual donde los controles eleven y distingan el contenido debajo.
- **Material 3:** el diseño expresivo dirige atención a lo que importa, destacando acciones clave y agrupando elementos similares.
- **Práctica:** usar tamaño, forma y color para que el usuario sepa instantáneamente qué es lo más importante.

### 1.2 Ergonomía y zonas de alcance
- **Apple:** es más fácil y cómodo alcanzar un control cuando está en el medio o la parte inferior del display.
- **Material 3:** recomienda Navigation Bar (inferior) para dispositivos móviles.
- **Práctica:** acciones principales y navegación en la mitad inferior de la pantalla, al alcance del pulgar.

### 1.3 Adaptabilidad del sistema
- **Apple:** adaptarse sin costuras a cambios de apariencia (orientación, Dark Mode, Dynamic Type).
- **Material 3:** M3 habilita experiencias personales, adaptativas y expresivas — desde color dinámico hasta layouts para pantallas grandes.
- **Práctica:** la interfaz debe funcionar en modo oscuro, distintos tamaños de pantalla y respetar el tamaño de texto del sistema.

### 1.4 Interacción funcional por sobre lo decorativo
- **Apple:** ayudar a concentrarse en tareas y contenido primario limitando la cantidad de controles en pantalla.
- **Material 3:** no comprometer la funcionalidad central por adornos visuales. Ninguna emoción compensa falta de claridad.
- **Práctica:** lo expresivo suma, pero si interfiere con la tarea principal, se elimina.

### 1.5 Consistencia y familiaridad
- **Apple:** adoptar convenciones de plataforma para mantener diseño consistente.
- **Material 3:** respetar patrones y estándares UI establecidos. Romper paradigmas básicos con diseño expresivo lleva a mala usabilidad.
- **Práctica:** no reinventar la rueda; usar patrones conocidos (listas verticales, tabs) en lugar de layouts experimentales.

### 1.6 Accesibilidad inclusiva
- **Apple:** accesibilidad como fundamento transversal del diseño.
- **Material 3:** diseño accesible permite que usuarios con diversas habilidades naveguen, entiendan y disfruten la UI.
- **Práctica:** contraste alto en colores y soporte de herramientas de asistencia desde el día uno.

### 1.7 Feedback inmediato y claro
- **Apple:** comunicar el estado constantemente.
- **Material 3:** los estados de interacción son indicadores visuales para comunicar el estado de un componente interactivo.
- **Práctica:** si el usuario toca algo, la interfaz debe responder al instante (animación, cambio de color o loader).

### 1.8 Diseño expresivo y emocional
- **Apple:** crear armonía entre elementos de interfaz, experiencias del sistema y dispositivos.
- **Material 3:** el diseño expresivo te hace sentir algo; hace que la marca se sienta fresca y moderna.
- **Práctica:** lo aburrido ya no funciona; formas y microinteracciones generan deleite sin romper usabilidad.

---

## 2. Divergencias críticas

| Área | Apple HIG (iOS) | Google M3 (Android) | Recomendación Web Responsive |
|---|---|---|---|
| **Navegación móvil** | Controles en medio/abajo (tab bars implícitos) | Navigation Bar inferior, máximo 5 ítems | **Material Navigation Bar** — estándar de industria |
| **Botones primarios** | Jerarquía sin componente flotante específico | Floating Action Buttons (FAB) y Extended FABs | **Híbrido** — botones grandes abajo; FAB solo si la acción debe estar siempre visible |
| **Tipografía** | SF Pro, SF Compact (ecosistema cerrado) | Roboto, Google Sans (escala expresiva de 15 estilos) | **Material/Roboto/Inter** — universales y soportadas para web |
| **Íconos** | SF Symbols (6900, exclusivos Apple) | Material Icons (open-source) | **Material Icons** — web-friendly y open-source |
| **Jerarquía y profundidad** | Materiales (blur, Liquid Glass) | Elevación tonal (overlays de color) | **Elevación tonal** — más eficiente en CSS que blur intensivo |
| **Gestos y táctil** | Fuerte dependencia de Multi-Touch del SO | Predictive back, animaciones, haptic rumble | **Apple (ergonomía)** — asegurar swipe-to-go-back y botones al alcance |

---

## 3. Tendencias 2025-2026 vigentes

### 3.1 Botones e interfaces "Expressive" más grandes
- **Qué es:** aumentar masivamente el tamaño de los hit targets (CTAs primarios).
- **Por qué importa:** M3 Expressive demostró que los usuarios encuentran elementos clave hasta 4 veces más rápido.
- **Aplicación:** el CTA ("Agendar turno", "Facturar") no va escondido arriba; grande, contrastante, justo arriba del teclado o en el fondo.

### 3.2 Color dinámico y elevación tonal
- **Qué es:** paletas derivadas del usuario; las sombras grises se reemplazan por variaciones tonales del color principal.
- **Por qué importa:** sensación premium y más integrada, diferenciando capas sin ensuciar la pantalla.
- **Aplicación:** en vez de `box-shadow` pesado en tarjetas, fondo sutilmente entonado con color primario sobre superficie base.

### 3.3 Motion Physics (animaciones con físicas)
- **Qué es:** sistema spring-based que hace sentir vivas las interacciones (rebotes, scroll elástico).
- **Por qué importa:** convierte rutinas diarias (descartar notificaciones) en momentos de deleite.
- **Aplicación:** microinteracciones al abrir modales o hacer swipe. Tarjetas que reaccionan táctil al toque.

### 3.4 Adaptive Layouts
- **Qué es:** diseños que escalan fluidamente y cambian de forma usando window size classes (no solo estirar).
- **Por qué importa:** un SaaS de pymes se usa en mostrador (tablet) y en la calle (teléfono).
- **Aplicación:** Navigation Bar (abajo) en móvil → Navigation Rail en tablet vertical → Navigation Drawer en desktop.

---

## 4. Checklist de 25 reglas no negociables

Verificación binaria (se cumple o no) antes de deploy.

### Layout y estructura
1. [ ] Acciones primarias y controles ubicados en el medio o abajo de la pantalla. (HIG)
2. [ ] Navigation Bar inferior si la navegación principal tiene 5 ítems o menos. (M3)
3. [ ] La interfaz se adapta sin romperse a cambios de orientación. (HIG)
4. [ ] Cantidad de controles en pantalla limitada estrictamente. (HIG)

### Tipografía
5. [ ] Soporta Dynamic Type (texto escalable por config del sistema). (HIG, M3)
6. [ ] Jerarquía clara entre Display, Headline y Body. (M3)
7. [ ] Body con tamaño 14-16 mínimo para legibilidad mobile. (M3)
8. [ ] Las acciones importantes conservan etiquetas de texto. (M3)

### Color y tema
9. [ ] Adaptación automática a Dark Mode. (HIG, M3)
10. [ ] Primary Color usado exclusivamente para la acción más importante. (M3)
11. [ ] Sombras tradicionales reemplazadas por Elevación Tonal. (M3)
12. [ ] Sin paletas de bajo contraste entre botón y texto. (M3)

### Interacción y gestos
13. [ ] Touch targets suficientemente grandes para tocarse rápido. (M3 Expressive)
14. [ ] Swipe-to-go-back y gestos naturales soportados. (HIG, M3)
15. [ ] Botones primarios con formatos claros (FAB o Extended FAB). (M3)
16. [ ] Button groups segmentados en lugar de selects nativos cuando hay pocas opciones. (M3)

### Feedback de estado
17. [ ] Indicadores de carga para pausas cortas. (M3)
18. [ ] Indicadores de progreso (líneas/ondas) para procesos en tiempo real. (M3)
19. [ ] Componentes muestran estados visuales (activo, presionado, inhabilitado). (M3)
20. [ ] Snackbars para confirmaciones breves en la zona inferior. (M3)
21. [ ] Efecto ripple o destello al tocar superficie. (M3)

### Accesibilidad
22. [ ] Contraste color con roles On-Primary sobre fondos Primary. (M3)
23. [ ] Jerarquía semántica respetada para lectores de pantalla. (M3)

### Performance percibida y emoción
24. [ ] El elemento interactivo clave se encuentra visualmente al instante. (M3)
25. [ ] Animaciones spring-based fluidas reaccionan a la entrada del usuario. (M3)

---

## 5. Patrones de componentes críticos en SaaS mobile

### 5.1 Navegación principal (bottom nav vs hamburger)
Recomendación unánime: **navegación inferior**. M3 dicta Navigation bar para dispositivos chicos al cambiar entre vistas (hasta 5 destinos). Apple indica controles en la base por ergonomía.

### 5.2 Formularios largos y multi-step
No cubierto en detalle por las fuentes. Solo se indica usar Text fields para ingreso con soporte de autocompletar. *[Aplicar criterio externo: progress indicator por pasos, validación inline, save-as-draft.]*

### 5.3 Tablas y listas de datos densos
No hay reglas para tablas densas en las fuentes. Para listas: usar Lists verticales continuas. **Nunca** carruseles o rejillas para leer datos secuenciales — la usabilidad colapsa.

### 5.4 Filtros y búsqueda
- Chips interactivos para filtrar rápido.
- Search bar dedicado para búsquedas.

### 5.5 Estados vacíos (empty states)
No documentado en las fuentes cargadas. *[Aplicar criterio externo: ilustración + CTA claro + texto explicativo.]*

### 5.6 Feedback de carga y errores
- Loading indicators circulares para esperas cortas.
- Progress indicators (líneas o custom) para progreso en tiempo real.
- Snackbar temporal inferior para errores/confirmaciones breves ("Turno guardado").

### 5.7 CTAs primarios y flotantes
- Botones grandes y expresivos en zona inferior.
- FABs o Extended FABs para acciones primarias.
- Se pueden asociar a un Toolbar.

### 5.8 Modales, bottom sheets y diálogos
- **Bottom sheets** anclados en la base para información o sub-tareas (ej: Detalles del turno).
- **Dialogs** interrumpiendo al usuario solo para confirmaciones obligatorias (ej: "Borrar factura").

---

## 6. Antipatrones frecuentes en web-mobile (errores a evitar)

1. **CTA en la cabecera (Top App Bar).**
   → Bajarlo, grande, justo arriba del teclado o al fondo. Los usuarios lo ven 4× más rápido.

2. **Solo íconos sin texto por falta de espacio.**
   → Mantener etiquetas. Remover labels destruye métricas de usabilidad en apps de gestión.

3. **Grillas/carruseles para datos densos.**
   → Listas verticales estándar. Innovar acá rompe legibilidad.

4. **Touch targets pequeños para meter más info.**
   → Agrandarlos. Ayuda drásticamente a usuarios +45 años, igualando tiempos con usuarios jóvenes.

5. **Drawer/Hamburguesa en mobile.**
   → Navigation Bar inferior si son 5 vistas o menos.

6. **Abuso del color Primary en textos y fondos simultáneos.**
   → Sistema de roles M3: botón Primary → texto On-Primary. Fondo Primary Container → texto On-Primary Container.

7. **Interfaz rígida tipo "faro blanco" de noche.**
   → Dark Mode obligatorio e integrado sin costuras.

8. **Exceso de botones en el Dashboard.**
   → Limitar controles. Agrupar secundarios en Split buttons o menús desde un FAB.

9. **Sin feedback al tocar componentes web.**
   → Estados visuales o microinteracciones tipo ripple para acusar recibo.

10. **Saturación de drop shadows grises.**
    → Elevación tonal (variación del color de fondo) para establecer jerarquía moderna.

---

## Notas sobre alcance de este documento

- **Cubre:** principios HIG + M3, componentes documentados en ambas fuentes, tendencias M3 Expressive 2025-2026.
- **No cubre:** patrones web-específicos (responsive breakpoints detallados, grid systems CSS), formularios multi-step, empty states, tablas densas, SEO/performance, accesibilidad WCAG nivel detallado.
- **Para gaps:** complementar con Refactoring UI, Nielsen Norman Group, Radix/shadcn docs, WCAG 2.2.