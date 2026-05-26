import type { Chapter } from '@/types';

function Ch04JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 4 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 4: The Visitor. Decay intensity: 0.3.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 4: The Visitor. Decay intensity: 0.3.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 4: The Visitor. Decay intensity: 0.3.]
      </p>
    </>
  );
}

export const ch04Josef: Chapter = {
  id: 'ch04-josef',
  number: 4,
  title: 'The Visitor',
  decayIntensity: 0.3,
  content: <Ch04JosefContent />,
};
