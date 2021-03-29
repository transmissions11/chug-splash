import {
  Box,
  Flex,
  Text,
  Badge,
  ListItem,
  UnorderedList,
  Code,
} from "@chakra-ui/react";

import { Column, Row } from "buttered-chakra";
import { ArrowDownIcon } from "@chakra-ui/icons";
import { useState } from "react";
import { Editor } from "./Editor";
import React from "react";

function App() {
  const [json, setJson] = useState([
    {
      action: "deploy",
      contract: "Lib_AddressManager",
      arguments: [],
      gasLimit: 4000000,
    },
    {
      action: "deploy",
      contract: "OVM_ChainStorageContainer",
      name: "OVM_ChainStorageContainer:CTC:batches",
      arguments: [
        "{Lib_AddressManager}.address",
        "OVM_CanonicalTransactionChain",
      ],
      gasLimit: 4000000,
    },
    {
      action: "call",
      target: "Lib_AddressManager",
      function: "setAddress",
      arguments: [
        "OVM_ChainStorageContainer:CTC:batches",
        "{OVM_ChainStorageContainer:CTC:batches}.address",
      ],
      gasLimit: 4000000,
    },
  ]);

  return (
    <Row
      mainAxisAlignment="flex-start"
      crossAxisAlignment="flex-start"
      height="100vh"
    >
      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="flex-start"
        width="50%"
        height="100%"
      >
        <Editor value={json} onChange={setJson} />
      </Column>

      <Column
        mainAxisAlignment="flex-start"
        crossAxisAlignment="center"
        width="50%"
        height="100%"
        p={8}
        overflow="scroll"
        color="#7a7a7a"
      >
        {json.map((task, index) => {
          return (
            <>
              <Box
                mt={4}
                p={4}
                borderRadius="10px"
                boxShadow="xl"
                width="500px"
                borderWidth="1px"
                key={index}
              >
                <Flex align="center">
                  <Badge
                    colorScheme={task.action === "deploy" ? "red" : "whatsapp"}
                  >
                    {task.action}
                  </Badge>
                  <Text
                    ml={2}
                    fontSize="sm"
                    fontWeight="bold"
                    color={
                      task.action === "deploy" ? "red.500" : "whatsapp.500"
                    }
                  >
                    {task.action === "deploy" ? task.contract : task.target}

                    {task.action === "call" ? (
                      <> &bull; {task.function}</>
                    ) : null}
                  </Text>
                </Flex>

                {task.name ? (
                  <Text mt={2} fontSize="12px">
                    <b>Instance Name</b>: {task.name}
                  </Text>
                ) : null}

                <UnorderedList pt={1} pl={1}>
                  {task.arguments.map((arg: string, index: number) => {
                    return (
                      <ListItem key={index}>
                        {arg.includes("}.address") ? (
                          <Code colorScheme="red">{arg}</Code>
                        ) : (
                          arg
                        )}
                      </ListItem>
                    );
                  })}
                </UnorderedList>
                <Text mt={1}>
                  <b>Gas Limit:</b> {task.gasLimit}
                </Text>
              </Box>
              {index !== json.length - 1 ? (
                <ArrowDownIcon color="#7a7a7a" mt={4} />
              ) : null}
            </>
          );
        })}
      </Column>
    </Row>
  );
}

export default App;
