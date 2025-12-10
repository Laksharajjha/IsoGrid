# IsoGrid (Healthcare Isolation Ward Allocation System)

## Objective
Build a high-concurrency, visual bed booking system for infectious disease wards.

## The "X-Factor"
Unlike standard booking apps, this uses **Adjacency Logic**. Users pick beds from a 2D Grid. A bed is "Blocked" if a neighbor (Left, Right, Top, Bottom) is an "Infectious" patient.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + TailwindCSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Database**: PostgreSQL (using Sequelize or Prisma ORM)
- **Real-time**: Socket.io

## Visual Style
- **Theme**: "Medical Glassmorphism"
- **Colors**:
    - Safe/Available: Soft Emerald Green
    - Occupied (Infectious): Pulsing Red
    - Blocked (Risk Zone): Amber/Orange with a "Hazard" striped pattern

## Core Backend Logic
- **Concurrency**: PostgreSQL REPEATABLE READ or SERIALIZABLE isolation.
- **Safety Check**: Before confirming a booking at [row, col], query the status of neighbors. If any are INFECTIOUS, reject the booking.

## System Architecture
- **Client**: React SPA served by Vite. Uses Socket.io-client for real-time updates.
- **Server**: Node.js/Express REST API. Handles business logic and DB transactions.
- **Database**: PostgreSQL. Stores Wards, Beds, Patients, and Bookings.
- **Real-time**: Socket.io server broadcasts bed status changes to all connected clients.

