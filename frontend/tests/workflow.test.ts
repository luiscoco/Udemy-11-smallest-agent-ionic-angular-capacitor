import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
describe('portable workflow generation',()=>{
  it('keeps all diagram styles explicit and source cards aligned',()=>{
    const template=readFileSync(new URL('../../scripts/workflow-template.svg',import.meta.url),'utf8');
    expect(readFileSync(new URL('../public/assets/workflow.svg',import.meta.url),'utf8')).toBe(template);
    expect(template).not.toMatch(/<style\b|\bclass=/);
    const arrows=template.match(/<(?:line|path)\b[^>]*marker-end=[^>]*>/g)||[];
    expect(arrows).toHaveLength(16);
    for(const arrow of arrows){expect(arrow).toContain('stroke="#285b98"');expect(arrow).toContain('fill="none"');}
    const cards=JSON.parse(readFileSync(new URL('../src/app/lesson.json',import.meta.url),'utf8')) as {number:number;title:string;source:string;code:string}[];
    const labels=[...template.matchAll(/<text[^>]*>(\d+)\. ([^<]+)<\/text>/g)];
    expect(cards).toHaveLength(16);
    cards.forEach((card,i)=>{expect(card.number).toBe(i+1);expect(card.title).toBe(labels[i][2]);expect(card.code.trim().length).toBeGreaterThan(15);expect(card.source).toMatch(/\.(ts|py)$/);});
  });
});
