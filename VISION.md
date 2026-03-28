# Product Vision

## Project Purpose

This repository defines and will implement a production-grade senior developer
portfolio platform. The goal is not to ship a static resume site, but a durable
personal platform that presents high-credibility work while allowing portfolio
content to evolve without code edits.

## Target Audience

- Recruiters screening technical candidates quickly
- Hiring managers evaluating seniority, judgment, and impact
- Professional contacts reviewing experience, case studies, and credibility

## Two Primary Surfaces

### Public Portfolio Website

The public-facing site is the recruiter-optimized experience. It showcases
experience, projects, technical depth, and business impact in a format that is
fast to scan, accessible, mobile-first, and production-ready.

### Admin Portal

The admin portal is a secure internal surface used to manage portfolio content.
It exists so the site owner can create, edit, order, publish, and maintain
portfolio data without changing source code.

## Core Objectives

- Present a senior-level engineering profile with strong credibility and clear business impact
- Enable fully dynamic content management through the admin portal
- Maintain high standards for performance, SEO, accessibility, and security
- Preserve clean architecture, modularity, and long-term maintainability

## Guiding Principles

- All public content is admin-managed unless explicitly defined as static
- Presentation and content management responsibilities stay clearly separated
- Data contracts, typing, and validation stay strict and consistent
- Public UX remains mobile-first, responsive, and accessible
- The platform is built with a production-first mindset, not as a demo

## Governance

Binding implementation rules live in `.specify/memory/constitution.md`.
Phase-specific requirements and contracts live under
`specs/001-phase-0-foundation/`.
