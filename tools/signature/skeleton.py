import numpy as np
from PIL import Image
from skimage.morphology import skeletonize

im = np.array(Image.open('alue.png').convert('L')) < 128
np.save('skel.npy', skeletonize(im))
