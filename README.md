### **@asandmann/png**

![npm bundle size](https://img.shields.io/bundlephobia/minzip/%40asandmann%2Fpng)
![NPM Version](https://img.shields.io/npm/v/%40asandmann%2Fpng?style=flat-square)



A zero-depencency, performant, and simple png encoder written in pure javascript.

---

```bash
npm install @asandmann/png
```

---

#### **API Reference**

##### **encode(data, options)**

Encodes the raw image data into PNG format.

- **Parameters:**
  - `data` (`Uint8Array`): The raw pixel data of the image.
  - `options` (`Object`): An object with the following properties:
    - `width` (`number`): The width of the image.
    - `height` (`number`): The height of the image.
    - `channels` (`number`): The number of color channels (e.g., 3 for RGB, 4 for RGBA).
    - `depth` (`number`, optional): The bit depth of the image. Default is 8 bits per channel.

- **Returns:**
  - `Uint8Array`: A buffer containing the PNG-encoded image.

---

#### **License**

GNU GENERAL PUBLIC LICENSE

