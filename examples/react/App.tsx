/**
 * motionary — React Example
 *
 * This example demonstrates how to use the useScrollAnimate and useScrollStagger
 * hooks in a React application.
 */

import React from 'react';
import { createReactHooks } from 'motionary/react';

const { useScrollAnimate, useScrollStagger } = createReactHooks(React);

const features = [
  { title: 'Zero Dependencies', desc: 'No lodash, no jQuery, no bloat.' },
  { title: 'TypeScript First', desc: 'Full type safety and IntelliSense.' },
  { title: 'Framework Agnostic', desc: 'Works with React, Vue, Svelte, and more.' },
  { title: 'Accessible', desc: 'Respects prefers-reduced-motion.' },
];

export default function App() {
  const heroTitleRef = useScrollAnimate({ animation: 'fade-in-down', duration: 1000 });
  const heroSubRef = useScrollAnimate({ animation: 'fade-in-up', delay: 300 });
  const featuresRef = useScrollStagger({ animation: 'fade-in-up', stagger: 120 });
  const ctaRef = useScrollAnimate({ animation: 'zoom-in', easing: 'spring' });

  return (
    <main style={{ fontFamily: 'system-ui, sans-serif', background: '#0a0a0a', color: '#fff', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '2rem' }}>
        <h1 ref={heroTitleRef} style={{ fontSize: 'clamp(2rem, 6vw, 5rem)', fontWeight: 800 }}>
          motionary
        </h1>
        <p ref={heroSubRef} style={{ fontSize: '1.2rem', color: '#aaa', marginTop: '1rem' }}>
          Lightweight. Dependency-free. Blazing fast.
        </p>
      </section>

      {/* Features Section */}
      <section style={{ maxWidth: 900, margin: '0 auto', padding: '6rem 2rem' }}>
        <ul ref={featuresRef} style={{ listStyle: 'none', padding: 0, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => (
            <li key={f.title} style={{ background: '#1a1a1a', border: '1px solid #333', borderRadius: 12, padding: '1.5rem' }}>
              <h3 style={{ marginBottom: '0.5rem' }}>{f.title}</h3>
              <p style={{ color: '#aaa', lineHeight: 1.6 }}>{f.desc}</p>
            </li>
          ))}
        </ul>
      </section>

      {/* CTA Section */}
      <section style={{ textAlign: 'center', padding: '6rem 2rem' }}>
        <div ref={ctaRef} style={{ display: 'inline-block', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', borderRadius: 16, padding: '3rem 4rem' }}>
          <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>Get Started Today</h2>
          <code style={{ background: 'rgba(0,0,0,0.3)', padding: '0.5rem 1rem', borderRadius: 8, fontSize: '1rem' }}>
            npm install motionary
          </code>
        </div>
      </section>
    </main>
  );
}
