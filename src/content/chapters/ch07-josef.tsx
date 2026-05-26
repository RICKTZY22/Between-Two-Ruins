import type { Chapter } from '@/types';

function Ch07JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 7 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 7: What He Did Not Do. Decay intensity: 0.7.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 7: What He Did Not Do. Decay intensity: 0.7.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 7: What He Did Not Do. Decay intensity: 0.7.]
      </p>
    </>
  );
}

export const ch07Josef: Chapter = {
  id: 'ch07-josef',
  number: 7,
  title: 'What He Did Not Do',
  decayIntensity: 0.7,
  content: <Ch07JosefContent />,
};
