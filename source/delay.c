/* delayline.c */
static double D[M];           // initialized to zero
static long ptr=0;            // read-write offset

double delayline(double x)
{
double y = D[ptr];          // read operation 
D[ptr++] = x;               // write operation
if (ptr >= M) { ptr -= M; } // wrap ptr if needed
//    ptr %= M;                   // modulo-operator syntax
return y;
}

