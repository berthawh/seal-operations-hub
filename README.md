# Seal Operations Hub

SEAL: COMPLETE PRODUCT UI DESIGN

Design a complete, polished web application UI for Seal, a training operations and certificate management platform.

This is primarily a UI/UX design exercise. Do not overcomplicate the backend or invent unnecessary product functionality. The objective is to establish a beautiful, modern, coherent visual direction that we can then carry into the production application.

DESIGN DIRECTION

The current interface feels too flat, basic and admin-like. Replace it with a genuinely considered product interface.

Use:

Strong card-based layouts

Floating and layered surfaces

Clear visual hierarchy

Generous spacing

Excellent typography

Thoughtful use of colour

Rounded containers where appropriate

Compact information cards rather than huge tables

Status chips and visual states

Progress indicators

Contextual actions

Useful empty states

Drawers, modals, popovers and dropdowns where they improve the experience

Subtle shadows and depth

Micro-interactions

Smooth page and state transitions

Subtle hover and press animations

Responsive layouts

Consistent navigation and page structure

Avoid the generic SaaS dashboard look where every page becomes a title followed by a giant table.

The interface should feel like a premium modern operational product, not a spreadsheet with a sidebar.

Create a reusable design system so every screen clearly belongs to the same product.

GLOBAL APP SHELL

Design the persistent application structure including:

Sidebar navigation

Header / top navigation

Search where useful

Notifications

User/account controls

Breadcrumbs where appropriate

Page actions

Responsive navigation

Settings

The primary Create action must open a menu containing:

Create Session
Create Certificate

Do not turn Create into a single Create Session button.

REQUIRED SCREENS

1. Dashboard

Create a visually rich operational overview using modular cards rather than one continuous screen.

Include useful summaries for:

Sessions

Upcoming training

Session status

Learners / attendees

Certificates

Certificates requiring action

Recent activity

Training progress

Organisations

Quick actions

Make this feel like a genuine command centre.

2. Sessions

Sessions Overview

Design the main Sessions page.

Allow users to quickly understand:

Session identity

Course

Date and time

Trainer

Organisation

Number of attendees

Session status

Progress

Certificate state

Tracking state

Relevant actions

Use a strong combination of cards, filtering, search, status controls and useful data presentation.

Create Session

Design the complete session creation experience.

It should feel focused and guided rather than like a huge administrative form.

Session Detail

This is an important operational workspace.

Include clearly structured areas for:

Session overview

Course

Date/time

Trainer

Organisation

Learner roster

Attendance / session progress

Status

Certificates

Tracking

Activity/history

Session actions

The page should make the current state of the session immediately understandable.

3. Courses

Courses Overview

Create a visual course library/catalogue rather than defaulting to a plain table.

Support:

Course identity

Course information

Certificate validity

Status

Sessions associated with the course

Useful actions

Do not invent course names or course data. Use clearly labelled placeholder content where real course data has not been supplied.

Course Detail

Show the individual course, its operational information and related sessions/certificates.

4. Certificates

Certificates should feel like credentials, not database records.

Certificates Overview

Create a visual certificate management experience supporting:

Certificate identity

Learner

Course

Training/completion date

Valid-until date

Certificate number

Organisation

Issue status

Delivery/status information

Relevant actions

Create Certificate

Create a focused certificate creation workflow.

Certificate Preview / Approval

Certificate generation must include a complete preview and approval stage before final PDF generation.

Support:

Front preview

Back preview

Learner information

Course information

Completion date

Valid-until date

Certificate number

Issue / Hold decision

Final approval

Certificate Detail

Create a polished credential detail page showing the certificate itself alongside its operational history and actions.

5. People

Do not create a meaningless generic contacts page.

Design People around the actual people participating in training operations.

The UI must clearly communicate:

Who the person is

Their role

Their organisation

Their relationship to sessions

Training/courses

Certificates

Relevant activity

People Overview

Create a clean people directory.

Person Detail

Create a profile/workspace showing their relevant training and certificate history.

6. Organisations

Organisations Overview

Design a strong organisation directory using useful cards/list hybrids rather than a plain CRM table.

Organisation Detail

Include:

Organisation information

Relevant people

Sessions

Courses/training activity

Certificates

Recent activity

Relevant operational actions

7. Tracking

Design Tracking as a proper operational monitoring workspace.

It should make it immediately obvious:

What is being tracked

Current state

What has completed

What requires attention

What is overdue or approaching a deadline

Related learner

Related session

Related certificate

Relevant actions

Use timelines, progress components, status cards and visual indicators where appropriate.

Do not invent tracking data purely to make the page look populated.

8. Automations

Create an Automations experience within Settings → Automations.

Design:

Automation overview

Automation cards

Enabled/disabled state

Trigger

Action

Related workflow

Automation detail/editing experience

Keep the architecture flexible for future automation functionality.

9. Settings

Create a coherent Settings area covering the application's configuration and administrative controls.

Include the appropriate navigation structure and the Automations section above.

Do not invent large amounts of settings purely to populate the UI.

PRODUCT-WIDE STATES

Also design the important supporting states across these screens:

Empty

Loading

Success

Error

Warning

Disabled

Selected

Issue / Hold

Completed

Upcoming

Requires attention

These should feel intentionally designed rather than browser defaults.

INTERACTION QUALITY

Add restrained animation and interaction polish throughout the prototype:

Card hover states

Button feedback

Dropdown transitions

Modal/drawer transitions

Navigation transitions

Progress animation

Status changes

Expand/collapse interactions

Toasts

Skeleton/loading states

Animation should make Seal feel responsive and alive without becoming distracting.

IMPORTANT

Prioritise visual quality, usability and coherence.

Do not simply recreate the existing UI.

Do not produce page after page of generic tables.

Do not invent major new product functionality.

Do not change the established workflows simply to make the design interesting.

Use the functionality described above as the product skeleton, then create the strongest UI system you can around it.

Build all screens as one coherent design direction with reusable components, cards, typography, spacing, navigation, states and interaction patterns.

The final result should give us a complete visual foundation for Seal that can be transferred into the production GitHub codebase.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/b66f463e-520e-43a8-bbf4-8c38d5ca08b9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
