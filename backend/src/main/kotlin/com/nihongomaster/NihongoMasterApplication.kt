package com.nihongomaster

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.runApplication

@SpringBootApplication
class NihongoMasterApplication

fun main(args: Array<String>) {
    runApplication<NihongoMasterApplication>(*args)
}
