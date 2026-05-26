import type { Chapter } from '@/types';

function Ch05JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 5 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 5: Reyna. Decay intensity: 0.45.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 5: Reyna. Decay intensity: 0.45.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 5: Reyna. Decay intensity: 0.45.]
      </p>
    </>
  );
}

export const ch05Josef: Chapter = {
  id: 'ch05-josef',
  number: 5,
  title: 'Reyna',
  decayIntensity: 0.45,
  content: <Ch05JosefContent />,
};
