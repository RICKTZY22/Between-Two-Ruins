import type { Chapter } from '@/types';

function Ch08JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 8 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 8: Static. Decay intensity: 0.8.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 8: Static. Decay intensity: 0.8.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 8: Static. Decay intensity: 0.8.]
      </p>
    </>
  );
}

export const ch08Josef: Chapter = {
  id: 'ch08-josef',
  number: 8,
  title: 'Static',
  decayIntensity: 0.8,
  content: <Ch08JosefContent />,
};
