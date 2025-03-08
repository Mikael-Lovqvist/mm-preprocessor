
Hello World!
//%% emit.push();
Here we have a
text block from
early before
//%% const early_text = emit.pop();
Let's take that earlier text block and put it under here:
//%% emit(early_text);

One use case of this is to be able to capture stuff from the template for other use.

