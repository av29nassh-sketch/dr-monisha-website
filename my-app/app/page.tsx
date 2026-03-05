'use client';

import { Facebook, Instagram, Twitter, Linkedin } from 'lucide-react';
import { MinimalistHero } from '@/components/ui/minimalist-hero';

export default function Home() {
  const navLinks = [
    { label: 'HOME', href: '#' },
    { label: 'PRODUCT', href: '#' },
    { label: 'STORE', href: '#' },
    { label: 'ABOUT US', href: '#' },
  ];

  const socialLinks = [
    { icon: Facebook, href: '#' },
    { icon: Instagram, href: '#' },
    { icon: Twitter, href: '#' },
    { icon: Linkedin, href: '#' },
  ];

  return (
    <MinimalistHero
      logoText="mnmlst."
      navLinks={navLinks}
      mainText="Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum ultrices, justo vel tempus."
      readMoreLink="#"
      imageSrc="https://ik.imagekit.io/fpxbgsota/image%2013.png?updatedAt=1753531863793"
      imageAlt="A portrait of a person in a black turtleneck, in profile."
      overlayText={{ part1: 'less is', part2: 'more.' }}
      socialLinks={socialLinks}
      locationText="Arlington Heights, IL"
    />
  );
}
