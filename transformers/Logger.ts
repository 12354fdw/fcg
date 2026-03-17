import ts from "typescript";

export default function transformer(program: ts.Program): ts.TransformerFactory<ts.SourceFile> {
	return (context) => {
		return (sourceFile) => {
			const levels = {
				$trace: "TRACE",
				$debug: "DEBUG",
				$info: "INFO",
				$warn: "WARN",
				$error: "ERROR",
			} as const;

			function visitor(node: ts.Node): ts.Node {
				if (ts.isCallExpression(node) && ts.isIdentifier(node.expression)) {
					const name = node.expression.text;
					const level = levels[name as keyof typeof levels];

					if (level) {
						const pos = sourceFile.getLineAndCharacterOfPosition(node.getStart());
						const line = pos.line + 1;
						const file = sourceFile.fileName.split("/").pop() ?? "unknown";

						const prefix = `[${level}] [${file}: ${line}] `;

						const printFunc =
							level === "WARN" || level === "ERROR"
								? ts.factory.createIdentifier("warn")
								: ts.factory.createIdentifier("print");

						// First argument: __LOG_CONTEXT .. "prefix"
						const firstArg = ts.factory.createBinaryExpression(
							ts.factory.createIdentifier("__LOG_CONTEXT"),
							ts.SyntaxKind.PlusToken,
							ts.factory.createStringLiteral(prefix),
						);

						// Preserve all original arguments
						const args: ts.Expression[] = [firstArg, ...node.arguments];

						// If no original args, still pass empty string
						if (node.arguments.length === 0) {
							args.push(ts.factory.createStringLiteral(""));
						}

						return ts.factory.createCallExpression(printFunc, undefined, args);
					}
				}

				return ts.visitEachChild(node, visitor, context);
			}

			const transformed = ts.visitNode(sourceFile, visitor) as ts.SourceFile;

			const logContextVar = ts.factory.createVariableStatement(
				undefined,
				ts.factory.createVariableDeclarationList(
					[
						ts.factory.createVariableDeclaration(
							"__LOG_CONTEXT",
							undefined,
							undefined,
							ts.factory.createConditionalExpression(
								ts.factory.createCallExpression(
									ts.factory.createPropertyAccessExpression(
										ts.factory.createCallExpression(
											ts.factory.createPropertyAccessExpression(
												ts.factory.createIdentifier("game"),
												"GetService",
											),
											undefined,
											[ts.factory.createStringLiteral("RunService")],
										),
										"IsServer",
									),
									undefined,
									[],
								),
								ts.factory.createToken(ts.SyntaxKind.QuestionToken),
								ts.factory.createStringLiteral("[SERV] "),
								ts.factory.createToken(ts.SyntaxKind.ColonToken),
								ts.factory.createStringLiteral("[CLNT] "),
							),
						),
					],
					ts.NodeFlags.Const,
				),
			);

			return ts.factory.updateSourceFile(transformed, [
				logContextVar,
				...transformed.statements,
			]);
		};
	};
}