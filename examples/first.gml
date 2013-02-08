// this is a test of the grammar's completeness and correctness to build an AST
// it isn't intended to be executed
script dostuff(x, y) {
    switch (3) {
        case 3:
            var a;
            for(z = 0; z < 5; z += 1) {
                a[3,7] = 1 - (2 + -2);
            }
            ;;
            (1 + 3).x += 7 ^ 3;
            if (2 + 3 == 4) {
                unreliable_fpu = true;
                x = 3;
            } else if (2 * 3 == 4) {
                panic_mode = true;
            } else working_as_normal = true; 
        case 4:
        default:
        break;
    } // this is really dumb
}
dostuff(1, 2);
with (thing) dostuff();
