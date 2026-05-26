import type { Chapter } from '@/types';

function Ch06JosefContent() {
  return (
    <>
      <p className="text-center italic text-[1.0625rem] mb-12">
        [Chapter 6 tagline — to be written.]
      </p>
      <hr />

      <p>
        [Chapter content to be written. This is Chapter 6: The Doorway. Decay intensity: 0.55.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 6: The Doorway. Decay intensity: 0.55.]
      </p>

      <p>
        [Chapter content to be written. This is Chapter 6: The Doorway. Decay intensity: 0.55.]
      </p>
    </>
  );
}

export const ch06Josef: Chapter = {
  id: 'ch06-josef',
  number: 6,
  title: 'The Doorway',
  decayIntensity: 0.55,
  content: <Ch06JosefContent />,
};
