<template>
  <div class="min-h-screen bg-white">
    <Navbar />
    <Hero />
    <ProblemSolution />
    <Stats />
    <Features />
    <HowItWorks />
    <!--<Testimonials /> -->
    <Pricing />
    <FAQ />
    <CTAFinal />
    <Footer />
  </div>
</template>

<script setup lang="ts">
import Navbar from './components/Navbar.vue'
import Hero from './components/Hero.vue'
import ProblemSolution from './components/ProblemSolution.vue'
import Stats from './components/Stats.vue'
import Features from './components/Features.vue'
import HowItWorks from './components/HowItWorks.vue'
import Testimonials from './components/Testimonials.vue'
import Pricing from './components/Pricing.vue'
import FAQ from './components/FAQ.vue'
import CTAFinal from './components/CTAFinal.vue'
import Footer from './components/Footer.vue'
</script>
