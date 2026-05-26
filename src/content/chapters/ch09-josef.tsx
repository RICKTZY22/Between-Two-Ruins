import type { Chapter } from '@/types';

function Ch09JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 9 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 9: The Other Room. Decay intensity: 0.9.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 9: The Other Room. Decay intensity: 0.9.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 9: The Other Room. Decay intensity: 0.9.]
      </p>
    </>
  );
}

export const ch09Josef: Chapter = {
  id: 'ch09-josef',
  number: 9,
  title: 'The Other Room',
  decayIntensity: 0.9,
  content: <Ch09JosefContent />,
};
