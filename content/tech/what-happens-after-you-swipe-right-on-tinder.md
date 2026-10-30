---
title: "What happens after you swipe right on Tinder?"
dek: "A reverse-engineering reel raises questions about photo scores, privacy and paid attention. Understanding it starts with separating what a model predicts from what happens to your matches."
slug: what-happens-after-you-swipe-right-on-tinder
category: tech
tags: ["Tinder", "Dating Apps", "Privacy", "Algorithms"]
author: "The Northstar Ledger"
author_slug: northstar-ledger
published: "2026-10-22T05:40:47.848248+00:00"
updated: 2026-10-30T19:33:05.166875+00:00
hero_image: "https://thenorthstarledger.com/tinder-photo-scores-smartphone.jpg"
hero_credit: "Illustrative smartphone photograph via PxHere / Wikimedia Commons, CC0 1.0; not a Tinder screenshot."
thumbnail: "https://thenorthstarledger.com/tinder-photo-scores-smartphone.jpg"
excerpt: "A reverse-engineering reel raises questions about photo scores, privacy and paid attention. Understanding it starts with separating what a model predicts from what happens to your matches."
reading_time: 6
location: ""
status: published
is_satire: false
indexable: true
editorial_notices: false
---

A swipe feels like a private judgment: someone catches your eye, and you decide whether you're interested. In Ayo Omolewa's telling, Tinder is making judgments of its own. The creator behind @ayoships says his reverse engineering uncovered systems that estimate both what you want and how much other people want you.[1]

His reel connects those estimates to photo selection, possible scoring disparities and prompts to buy Super Likes. It offers a useful way to think about the machinery behind the app. It does not expose Tinder's complete algorithm, and its most striking numbers describe his tests of a photo model, not measured changes in anyone's dating success.[1]

## The app learns from the choices you make

Tinder's public explanation says recommendations take account of recent activity, location, preferences, profile information and Likes and Nopes. It also says the service uses anonymized cues from photos to suggest profiles resembling ones a member previously liked. That explanation is marked as updated in July 2022, so it should not be mistaken for a complete description of today's implementation.[2]

Omolewa describes a more specific mechanism: converting liked photos into embeddings and averaging them to represent a user's preferences. He also shows fields for photo views and viewing duration, which he interprets as evidence that the app tracks how long users look at pictures.[1]

An embedding is a numerical representation a computer can use to compare images. In the system he describes, previous choices become information for future recommendations. Tinder's published description supports the broad idea of learning from photo preferences; it does not independently confirm his precise embedding calculation or the weight given to viewing time.[1][2]

Neither account suggests the app can read your mind. A pattern in the photos you like is evidence about your behavior, not proof that the system understands whom you would enjoy dating.

## A photo score is not a match count

The reel introduces RSRR, short for "right swipe received ratio." Omolewa describes it as the share of people who see a profile and swipe right. He then says a model extracted from the app predicts that measure for individual photos.[1]

Those are different things. An observed response rate records behavior. A photo model estimates a response. A match requires mutual interest, and whether someone encounters your profile is another question entirely. The clip does not establish how a predicted photo score translates into profile exposure or eventual matches.[1]

That distinction is easy to lose when a percentage flashes across a screen. A lower model score does not, by itself, mean an equivalent percentage fewer matches. Nor is a predicted response to a photograph an objective measure of someone's attractiveness or worth.

There is also a version problem. One code graphic is labeled Tinder Android 13.0.0 from 2022; another cites iOS 17.39.2. These are clues about particular app artifacts, not proof that every account currently encounters the same system.[1]

## Photo Selector raises a narrower privacy question

Tinder introduced Photo Selector in July 2024 as an AI feature that helps users choose profile pictures. Its announcement describes taking a selfie, granting camera-roll access and reviewing suggested images. Users decide which pictures to add to their profiles.[3]

Omolewa says the implementation he examined can scan up to 20,000 photos from the previous two years and select 27. He contrasts an on-device privacy assurance displayed in the reel with technical fields labeled for photo scores, including RSRR, explicitness and apparent youth, which he says are collected.[1]

The distinction is between keeping original images on a phone and transmitting information derived from those images. Those are separate privacy questions. Processing can happen locally while a service still receives resulting measurements.

The reel does not establish that Tinder uploads an entire camera roll, sells private photos or retains every displayed score. It also does not show enough to determine how identifiable such measurements are or how long they persist.[1]

A useful privacy explanation would tell users which derived measurements leave the device, what they are linked to and how they are used. "On-device" alone does not answer all of that.

## The bias findings deserve scrutiny, not dating hacks

Omolewa says he tested the extracted model against more than 800 synthetic images. His graphics report a typical 3.5-fold score change for mirror selfies and a 15% decrease in darker-skin comparisons, with decreases in all 12 scenes shown for that category.[1]

He reports score increases for shirtless men and women in low-neckline clothing. Other patterns differed by gender: sunglasses and outdoor settings helped men's scores in his tests, while women's sunglasses scores fell and the outdoor category was labeled "no change." His graphics report lower scores for heavier and older depictions of women; the comparable male categories were labeled "no change," although individual results moved in both directions.[1]

These are the creator's reported findings. The short reel does not provide a reproducible dataset, full experimental controls or an independent replication. It does not establish whether edits changed other image characteristics alongside the trait being tested.[1]

If reproduced under controlled conditions, unequal responses to skin tone, body size or age would warrant examination. Tinder's public explanation says its recommendation algorithm does not track ethnicity, but that statement does not resolve whether an image model can produce unequal outputs without an explicit ethnicity field.[2]

The clip supports asking better questions. It does not support telling darker-skinned users they receive exactly 15% fewer matches, or promising that a mirror selfie will multiply anyone's dating prospects.

## Where popularity meets the purchase prompt

The reel's commercial argument centers on a displayed message suggesting a Super Like after someone likes a popular profile. Omolewa shows labels including `super_like.high_rsrr_upsell` and a revenue-related analytics event.[1]

His interpretation is that a popularity signal can trigger a sales opportunity: the app identifies someone who attracts interest, then encourages an interested user to purchase an additional feature.[1]

That is more specific than claiming Tinder locks every popular person behind a paywall. The displayed material does not prove that a normal like is always blocked, that payment guarantees a match or that Tinder intentionally prevents successful relationships. A revenue event label is also not a report showing exactly how much a particular person's popularity earned.[1]

The distinction matters because the narrower claim is worth examining on its own. Users should be able to understand when a recommendation about improving their chances is also a sales pitch.

## What the reel leaves unanswered

Omolewa's account presents Tinder as a system that learns preferences, estimates likely interest and uses popularity in an upsell flow. Tinder's own published explanation confirms some broad recommendation inputs, but neither source supplies a complete, independently audited account of the current system.[1][2]

The unanswered questions concern deployment and consequences: which model versions are active, what derived photo data leaves a device, whether the reported disparities survive controlled testing, and how any score affects real profile exposure. This review has not independently authenticated the extracted code, replicated the experiments or obtained a Tinder response to the specific allegations.

For users, the sensible takeaway is to resist treating a disappointing run of matches as a scientific verdict on themselves. The reel describes predictions and purchase prompts. It does not demonstrate that an app can calculate what a relationship with you would be worth.

## Sources

[1] https://www.instagram.com/reel/DeuN3vGRrMV/?srtk=bzh3aDNjcm9xbnI1 — Ayo Omolewa (@ayoships), Tinder reverse-engineering reel; reviewed transcript and visuals
[2] https://www.tinderpressroom.com/powering-tinder-r-the-method-behind-our-matching — Tinder: The method behind our matching (updated July 11, 2022)
[3] https://www.tinderpressroom.com/Tinder-R-Unveils-Photo-Selector-AI-Feature-to-Make-Choosing-Profile-Pictures-Easier — Tinder: Photo Selector launch announcement (July 17, 2024)
