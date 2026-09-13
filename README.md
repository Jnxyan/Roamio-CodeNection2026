Roamio by CookedPotatoes
Team: Ng Xin Yan, Tan Wen Xuan
Problem Statement: Travel Planner
Video Presentation: https://youtu.be/5WwJlkhSxWc?si=bT0TscWUSieGJ-r0
Presentation Slides: https://canva.link/ws2z482bbytalze
1. Project Overview
The Problem. Travel planning is split across booking websites, itinerary apps and group chats. Travellers must research places, collect group preferences, enter information manually, and rebuild plans when conditions change. Apps such as Wandelog and Triplt organise itineraries or reservations, but much of the discovery and replanning remains manual.
Our Solution. Our community-first planner lets users browse rated itineraries and plans, read advice from previous travellers, and copy plans as an editable template. Invited members saved interests and rank suitable places for the group. Weather checks begin three days before outdoor activities, update daily and suggest a plan B when needed.
Core features:
1. Community plans with ratings, advice, reminders and cautions
2. One-click Use as Template
3. Profile interests and group-based place suggestions
4. Editable timeline with weather monitoring and Plan B
2. Ideation & Process
2.1 Ideas We Considered
Idea
Why it was dropped / kept
Community plans include reminder and caution (Chosen)
Gives user practical information from travellers with real experience
Profile interests (Chosen)
Reuses member’s  interests and removes repeated forms or questions
Use as Template (Chosen)
Turn inspiration into an editable plan without starting from zero.
Weather-based Plan B (Chosen)
Helps users adjust outdoor activities when conditions change
Manual interest voting (Dropped)
Requires users to create choices, wait for votes and process results for every trip

2.2 Ideation Boards

mindmap.png
2.3 Mentor Consultation
Date
Mentor
Feedback Received
What Was Changed
11 September 2026
Zach Khong
Focus on community plans, reusable templates, and simple group-interest collection. Reduce manual input so users can plan quickly.
We moved interests to user profiles, allowed members to one time collect interest data and allowed to be invited to a plan, and refocused the presentation on community templates and Plan b

Even if you disagreed with a piece of feedback, you can say so and explain why. You will not be penalised for doing something against a mentor’s advice, it will still count as engaging with it.
3. Design & Prototype
UI Prototype: Roamio — Travel Planner



Explore destinations and Community Plans. Users can search, filter, and save destinations or itineraries shared by other travellers. 

Personalized Travel Interests Users can select or edit their travel interests, allowing Roamio to recommend more relevant places and activities. 

Travel Tips and Reusable Templates. Users can review packing lists, cautions, and cultural tips, then select “Use as template” to customize the itinerary for their own trip.
4. What Makes It Different

1, reusable community plans - share schedule and itineraries become editable templates, while the original traveller’s reminders and cautions remain available
2. Automatic group matching - invited members’ profile interests are combined without requiring another survey or voting session.
3. Itinerary-aware plan B - weather checks are linked to scheduled outdoor activities and produce replacement suggestions
4. Community feedback loop - completed trips can be shared again, creating more useful templates for future travellers

5. Technical Architecture & Feasibility
Tech stack
Frontend: HTML
Backend: mySQL
Service: weather API, Google Maps Places
Hosting: Vercel
System architecture diagram (Optional, if you feel it would help the reviewers understand your architecture better)
Build plan & scope
During the building phase, we will develop a functional Roamio prototype focused on four core features:
User profiles with selectable travel interests
Community itineraries with ratings, reviews, reminders, and cautions
Reusable itinerary templates that users can save and customize
Personalized attraction recommendations for individual and group trips
We will also integrate Google Maps Places and weather data to support destination planning. Flight and hotel booking, payment services, and advanced AI recommendations will remain outside the current scope and may be developed in future versions.
