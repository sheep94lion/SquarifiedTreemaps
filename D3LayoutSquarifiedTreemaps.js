/**
 * Created by sheep94lion_local on 2017/11/7.
 */
d3.squarifiedtreemap = function() {
    var root_rect;
    var total_area;
    var value_function;
    function squarified_layer(node) {
        //set every child's rect
        var row = [];
        var available_rect = node.rect;
        function worst(current_row) {
            length = available_rect[2][0] - available_rect[0][0];
            width = available_rect[2][1] - available_rect[0][1];
            w = Math.min(length, width);
            areas = node.children.map(function(n) {return n.area});
            console.log(areas);
            sum_area = areas.reduce(function(a, b) {return a + b;}, 0);
            max_area = areas[0];
            min_area = areas[areas.length - 1];
            ar1 = w * w * max_area / (sum_area * sum_area);
            ar2 = sum_area * sum_area / (w * w * min_area);
            return Math.max(ar1, ar2);
        };
        function get_width(rect_to_get_width) {
            return rect_to_get_width[1][1] - rect_to_get_width[0][1];
        };
        function get_length(rect_to_get_length) {
            return rect_to_get_length[2][0] - rect_to_get_length[1][0];
        };
        function get_area(rect_to_get_area) {
            return (rect_to_get_area[2][0] - rect_to_get_area[0][0]) * (rect_to_get_area[2][1] - rect_to_get_area[0][1]);
        }
        function layoutone(direction, rect, node_to_layout, iflast) {
            node_to_layout.rect = [];
            if(iflast) {
                node_to_layout.rect.push(rect[0]);
                node_to_layout.rect.push(rect[1]);
                node_to_layout.rect.push(rect[2]);
                node_to_layout.rect.push(rect[3]);
                rect_remain = [];
                return rect_remain;
            } else if (direction == 0) {// split horizentally
                node_to_layout.length = get_length(rect);
                node_to_layout.width = node_to_layout.area / node_to_layout.length;
                node_to_layout.rect.push(rect[0]);
                node_to_layout.rect.push([rect[0][0], rect[0][1] + node_to_layout.width]);
                node_to_layout.rect.push([rect[2][0], rect[0][1] + node_to_layout.width]);
                node_to_layout.rect.push(rect[3]);
                rect_remain = [];
                rect_remain.push(node_to_layout.rect[1]);
                rect_remain.push(rect[1]);
                rect_remain.push(rect[2]);
                rect_remain.push(node_to_layout.rect[2]);
                return rect_remain;
            } else {
                node_to_layout.width = get_width(rect);
                node_to_layout.length = node_to_layout.area / node_to_layout.width;
                node_to_layout.rect.push(rect[0]);
                node_to_layout.rect.push(rect[1]);
                node_to_layout.rect.push([rect[0][0] + node_to_layout.length, rect[1][1]]);
                node_to_layout.rect.push([rect[0][0] + node_to_layout.length, rect[0][1]]);
                rect_remain = [];
                rect_remain.push(node_to_layout.rect[3]);
                rect_remain.push(node_to_layout.rect[2]);
                rect_remain.push(rect[2]);
                rect_remain.push(rect[3]);
                return rect_remain;
            }
        };
        function layout() {
            var rect_remain;
            var direction;
            area_array = row.map(function(node) {return node.area;});
            area_sum = area_array.reduce(function(a, b) {return a + b;}, 0);
            length = available_rect[2][0] - available_rect[0][0];
            width = available_rect[2][1] - available_rect[0][1];
            if (width < length) {
                temp_node = {};
                temp_node.area = area_sum;
                layoutone(1, available_rect, temp_node, false);
                direction = 0;
                rect_remain = temp_node.rect;
                available_rect[0] = rect_remain[3];
                available_rect[1] = rect_remain[2];
            } else {
                temp_node = {};
                temp_node.area = area_sum;
                layoutone(0, available_rect, temp_node, false);
                direction = 1;
                rect_remain = temp_node.rect;
                available_rect[0] = rect_remain[1];
                available_rect[3] = rect_remain[2];
            }
            row.forEach(function(item, index) {
                rect_remain = layoutone(direction, rect_remain, item, index == row.length - 1);
            });
        };

        if (node.children) {
            node.children.forEach(function(e) {
                if (row.length == 0 || worst(row) > worst(row.concat([e]))) {
                    row.push(e);
                } else {
                    layout();
                    row = [e];
                }
            });
            if (row.length > 0) {
                layout();
            }
        }

    }
    function squarifiedtreemap(d) {
        var tree = d3.hierarchy(d);
        console.log(tree);
        tree.sum(value_function);
        ratio = total_area / tree.value;
        tree.each(function(node) {
            node.area = node.value * ratio;
        });
        console.log(tree);
        tree.rect = root_rect;
        tree.sort(function(a, b) {
            if (a.value > b.value) {
                return -1;
            } else {
                return 1;
            }
        });
        tree.eachBefore(squarified_layer);
        console.log(tree);
        return tree;
    }
    squarifiedtreemap.root_rect = function (x) {
        root_rect = x;
        length = root_rect[2][0] - root_rect[0][0];
        width = root_rect[2][1] - root_rect[0][1];
        total_area = length * width;
        return squarifiedtreemap;
    }
    squarifiedtreemap.value = function (value_f) {
        value_function = value_f;
        return squarifiedtreemap;
    }
    return squarifiedtreemap;
}