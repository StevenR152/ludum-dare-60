// Places a sprite entity so the opaque part of its image (`content`: x, y, w, h in image pixels) exactly fills
// `box` (x, y, w, h in the world): the whole image is scaled and offset to match. Call it after the sprite
// component is on the entity, which gives it the image's own size.
//   fitArt(Crafty.e("2D, DOM, kilnBase"), KILN_ART_CONTENT, KILN_ART_BOX);
function fitArt(entity, content, box) {
    var scale = box.w / content[2];
    return entity.attr({
        x: box.x - content[0] * scale,
        y: box.y - content[1] * scale,
        w: entity.w * scale,
        h: entity.h * scale,
        z: OUTSIDE_ART_Z
    });
}
