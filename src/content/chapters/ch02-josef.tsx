import type { Chapter } from '@/types';

function Ch02JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 2 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 2: The Shift. Decay intensity: 0.1.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 2: The Shift. Decay intensity: 0.1.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 2: The Shift. Decay intensity: 0.1.]
      </p>
    </>
  );
}

export const ch02Josef: Chapter = {
  id: 'ch02-josef',
  number: 2,
  title: 'The Shift',
  decayIntensity: 0.1,
  content: <Ch02JosefContent />,
};
